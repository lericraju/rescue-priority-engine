import random
import copy
import heapq
from intelligence.mine_layout import SITES

class SimulationEngine:
    def __init__(self):
        self.sites_state = {
            site_name: {
                "gas_heatmap": [[0.0 for _ in range(10)] for _ in range(8)],
                "gas_origins": [],
                "rescue_teams": copy.deepcopy(data["rescue_teams"]),
                "active_missions": {}, # team_id -> target_pos
                "collapsed_cells": [], # list of (r, c) tuples
                "new_events": [] # list of event dicts
            }
            for site_name, data in SITES.items()
        }

    def trigger_gas_origin(self, site, row, col):
        if site in self.sites_state:
            self.sites_state[site]["gas_origins"].append((row, col))
            self.sites_state[site]["gas_heatmap"][row][col] = 1000.0

    def spread_gas(self, site):
        """Simulate gas diffusion through tunnels for a specific site"""
        if site not in self.sites_state: return
        
        state = self.sites_state[site]
        grid = SITES[site]["grid"]
        heatmap = state["gas_heatmap"]
        
        new_heatmap = copy.deepcopy(heatmap)
        rows = len(grid)
        cols = len(grid[0])

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 1:
                    neighbors = self._get_neighbors(r, c, rows, cols)
                    total_neighbor_gas = 0
                    active_neighbors = 0
                    for nr, nc in neighbors:
                        if grid[nr][nc] == 1:
                            total_neighbor_gas += heatmap[nr][nc]
                            active_neighbors += 1
                    
                    if active_neighbors > 0:
                        new_heatmap[r][c] = (heatmap[r][c] * 0.7) + (total_neighbor_gas / active_neighbors * 0.3)
        
        for r in range(rows):
            for c in range(cols):
                new_heatmap[r][c] *= 0.99
                
        state["gas_heatmap"] = new_heatmap

    def _get_neighbors(self, r, c, rows, cols):
        neighbors = []
        if r > 0: neighbors.append((r-1, c))
        if r < rows-1: neighbors.append((r+1, c))
        if c > 0: neighbors.append((r, c-1))
        if c < cols-1: neighbors.append((r, c+1))
        return neighbors

    def dispatch_team(self, site, team_id, target_pos):
        """Start a rescue mission for a team to a target position"""
        if site in self.sites_state:
            self.sites_state[site]["active_missions"][team_id] = target_pos
            for team in self.sites_state[site]["rescue_teams"]:
                if team["id"] == team_id:
                    team["status"] = "In Transit"

    def update_rescue_teams(self, site):
        """Move rescue teams towards their targets using A*"""
        if site not in self.sites_state: return
        
        state = self.sites_state[site]
        grid = SITES[site]["grid"]
        
        for team in state["rescue_teams"]:
            mission_target = state["active_missions"].get(team["id"])
            if mission_target:
                current_pos = (team["location"]["row"], team["location"]["col"])
                target_pos = (mission_target["row"], mission_target["col"])
                
                if current_pos == target_pos:
                    team["status"] = "On Site"
                    continue
                
                path = self._astar(grid, current_pos, target_pos, state["collapsed_cells"])
                if path and len(path) > 1:
                    next_step = path[1]
                    
                    # 15% chance to encounter a collapse when moving, if it's not the target
                    if random.random() < 0.15 and next_step != target_pos:
                        test_collapsed = state["collapsed_cells"] + [next_step]
                        alt_path = self._astar(grid, current_pos, target_pos, test_collapsed)
                        if alt_path: # Only collapse if there's an alternative path
                            state["collapsed_cells"].append(next_step)
                            state["new_events"].append({
                                "team_id": team["id"],
                                "message": f"Path blocked at ({next_step[0]}, {next_step[1]}). Rerouting...",
                                "level": "warning"
                            })
                            continue # Skip movement this tick, recalculate next tick
                            
                    team["location"]["row"] = next_step[0]
                    team["location"]["col"] = next_step[1]

    def _astar(self, grid, start, goal, collapsed_cells):
        rows, cols = len(grid), len(grid[0])
        pq = [(0, start)]
        came_from = {start: None}
        cost_so_far = {start: 0}

        while pq:
            _, current = heapq.heappop(pq)
            if current == goal: break

            for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                neighbor = (current[0] + dr, current[1] + dc)
                if 0 <= neighbor[0] < rows and 0 <= neighbor[1] < cols and grid[neighbor[0]][neighbor[1]] == 1 and neighbor not in collapsed_cells:
                    new_cost = cost_so_far[current] + 1
                    if neighbor not in cost_so_far or new_cost < cost_so_far[neighbor]:
                        cost_so_far[neighbor] = new_cost
                        priority = new_cost + abs(neighbor[0] - goal[0]) + abs(neighbor[1] - goal[1])
                        heapq.heappush(pq, (priority, neighbor))
                        came_from[neighbor] = current
        
        if goal not in came_from: return None
        
        path = []
        curr = goal
        while curr is not None:
            path.append(curr)
            curr = came_from[curr]
        return path[::-1]

    def forecast_survival(self, worker, minutes=60):
        current_prob = worker.get("survival_probability", 0.9)
        risk_sum = worker.get("vital_risk", 0.1) + worker.get("gas_risk", 0.1) + worker.get("hypoxia_risk", 0.1)
        degradation_factor = 0.01 * (risk_sum + 0.1)
        
        forecast = []
        for i in range(minutes + 1):
            prob = current_prob * (1 - degradation_factor) ** i
            forecast.append({"minute": i, "probability": round(max(0, prob), 4)})
        return forecast

sim_engine = SimulationEngine()

