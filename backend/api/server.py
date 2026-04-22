from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from backend.api.rescue_service import compute_rescue_priorities
import logging
import time
import random
import asyncio
import copy
from intelligence.mine_layout import SITES
from intelligence.simulation_engine import sim_engine

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Rescue Priority Engine API",
    version="2.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
#  Simulation State
# ---------------------------------------------------------------------------
DISASTER_START_TIME = time.time()

# Helper to create initial worker states with simulation fields
def init_workers_for_site(site_name):
    site_data = SITES[site_name]
    workers = []
    for wid, loc in site_data["workers"].items():
        workers.append({
            "id": wid,
            "site": site_name,
            "is_live": "LIVE" in wid,
            "heart_rate": random.uniform(65, 110),
            "immobile_minutes": random.uniform(0, 10),
            "gas_ppm": random.uniform(0, 50),
            "gas_exposure_minutes": random.uniform(0, 5),
            "oxygen_percent": random.uniform(18.5, 20.9),
            "hypoxia_minutes": random.uniform(0, 5),
            "rescue_feasibility": random.uniform(0.3, 0.95),
            "location": copy.deepcopy(loc),
        })
    return workers

live_state = {
    "is_simulating": False,
    "last_updated": time.time(),
    "sites": {
        site_name: {
            "workers": init_workers_for_site(site_name),
            "rescue_teams": copy.deepcopy(SITES[site_name]["rescue_teams"]),
            "gas_heatmap": [[0.0 for _ in range(10)] for _ in range(8)],
            "collapsed_cells": [],
        }
        for site_name in SITES
    }
}

event_log = []

def log_event(worker_id: str, level: str, message: str, site: str = "All"):
    event_log.append({
        "timestamp": round(time.time() - DISASTER_START_TIME, 1),
        "worker_id": worker_id,
        "level": level, 
        "message": message,
        "site": site
    })
    if len(event_log) > 100: event_log.pop(0)

# ---------------------------------------------------------------------------
#  Simulation Logic
# ---------------------------------------------------------------------------
def advance_simulation():
    current_time = time.time()
    real_elapsed = current_time - live_state["last_updated"]

    if not live_state["is_simulating"]:
        live_state["last_updated"] = current_time
        return

    # 4x Simulation Speed Multiplier
    sim_multiplier = 4.0
    elapsed = real_elapsed * sim_multiplier

    for site_name, site_data in live_state["sites"].items():
        # 1. Update Environment (Gas Spread)
        sim_engine.spread_gas(site_name)
        site_data["gas_heatmap"] = sim_engine.sites_state[site_name]["gas_heatmap"]

        # 2. Update Rescue Teams (Movement)
        sim_engine.update_rescue_teams(site_name)
        site_data["rescue_teams"] = sim_engine.sites_state[site_name]["rescue_teams"]
        
        # 2b. Pull collapsed cells and new events
        site_data["collapsed_cells"] = sim_engine.sites_state[site_name].get("collapsed_cells", [])
        new_events = sim_engine.sites_state[site_name].get("new_events", [])
        for ev in new_events:
            log_event(ev["team_id"], ev["level"], ev["message"], site_name)
        sim_engine.sites_state[site_name]["new_events"] = []

        # 3. Update Teams & Extraction Logic
        for team in site_data["rescue_teams"]:
            if team["status"] == "On Site":
                mission_target = sim_engine.sites_state[site_name]["active_missions"].get(team["id"])
                
                # If target is a worker in need of rescue
                worker = next((w for w in site_data["workers"] if (w["location"]["row"], w["location"]["col"]) == (mission_target["row"], mission_target["col"]) and not w.get("is_safe")), None)
                
                if worker and not worker.get("rescued_by"):
                    # Arrived at worker!
                    worker["rescued_by"] = team["id"]
                    log_event(team["id"], "critical", f"Secured {worker['id']}! HR: {worker['heart_rate']:.0f}, O2: {worker['oxygen_percent']:.1f}%. Extracting...", site_name)
                    
                    # Return to base
                    orig_team = next(t for t in SITES[site_name]["rescue_teams"] if t["id"] == team["id"])
                    sim_engine.dispatch_team(site_name, team["id"], orig_team["location"])
                    
                    # Override status to Extracting
                    for st_team in sim_engine.sites_state[site_name]["rescue_teams"]:
                        if st_team["id"] == team["id"]:
                            st_team["status"] = "Extracting"
                            st_team["extracting_worker"] = worker["id"]
                    team["status"] = "Extracting"
                    team["extracting_worker"] = worker["id"]
                    
                elif team.get("extracting_worker"):
                    # Arrived back at base
                    worker_id = team["extracting_worker"]
                    log_event(team["id"], "success", f"Successfully extracted {worker_id} to base.", site_name)
                    team["status"] = "Ready"
                    team.pop("extracting_worker", None)
                    for st_team in sim_engine.sites_state[site_name]["rescue_teams"]:
                        if st_team["id"] == team["id"]:
                            st_team["status"] = "Ready"
                            st_team.pop("extracting_worker", None)
                    worker = next((w for w in site_data["workers"] if w["id"] == worker_id), None)
                    if worker:
                        worker["is_safe"] = True
                        
            elif team.get("status") == "Extracting" and team.get("extracting_worker"):
                # Drag worker along
                worker = next((w for w in site_data["workers"] if w["id"] == team["extracting_worker"]), None)
                if worker:
                    worker["location"]["row"] = team["location"]["row"]
                    worker["location"]["col"] = team["location"]["col"]
                    worker["oxygen_percent"] = max(worker["oxygen_percent"], 20.0) # Stop degradation during extraction

        # 4. Update Workers
        for w in site_data["workers"]:
            # Heart rate fluctuation
            w["heart_rate"] += random.uniform(-1.5, 2.0)
            w["heart_rate"] = max(40.0, min(170.0, w["heart_rate"]))

            # Environmental impact from heatmap
            loc = w["location"]
            gas_env = site_data["gas_heatmap"][loc["row"]][loc["col"]]
            
            w["gas_ppm"] = (w["gas_ppm"] * 0.85) + (gas_env * 0.15)
            w["oxygen_percent"] -= (gas_env / 1200.0) * random.uniform(0.05, 0.15)
            w["oxygen_percent"] -= 0.05 * elapsed # Baseline degradation
            w["oxygen_percent"] = max(8.0, w["oxygen_percent"])

            # Degradation
            w["immobile_minutes"] += elapsed / 60.0
            if w["oxygen_percent"] < 19.5:
                w["hypoxia_minutes"] += elapsed / 60.0
                
            # Evacuation movement
            if w.get("status") == "EVACUATING" and not w.get("is_safe"):
                exits = SITES[site_name].get("exit_points", []) + SITES[site_name].get("entry_points", [])
                if exits:
                    current_pos = (w["location"]["row"], w["location"]["col"])
                    best_path = None
                    for ex in exits:
                        target_pos = (ex["row"], ex["col"])
                        path = sim_engine._astar(SITES[site_name]["grid"], current_pos, target_pos, site_data.get("collapsed_cells", []))
                        if path and (best_path is None or len(path) < len(best_path)):
                            best_path = path
                    
                    if best_path and len(best_path) > 1:
                        w["location"]["row"] = best_path[1][0]
                        w["location"]["col"] = best_path[1][1]
                    
                    # Check if reached exit
                    for ex in exits:
                        if w["location"]["row"] == ex["row"] and w["location"]["col"] == ex["col"]:
                            w["is_safe"] = True
                            w["status"] = "SAFE"
                            log_event(w["id"], "success", f"{w['id']} has successfully self-evacuated!", site_name)
            
            # Simple threshold alerts
            if w["gas_ppm"] > 400 and random.random() < 0.05:
                log_event(w["id"], "warning", f"High toxic gas exposure detected", site_name)

    live_state["last_updated"] = current_time

@app.get("/api/live_status")
def live_status(site: str = "Site A"):
    advance_simulation()
    if site not in live_state["sites"]:
        return {"error": "Invalid site"}
    
    site_data = live_state["sites"][site]
    # Compute priorities for the requested site
    ranked_workers = compute_rescue_priorities(copy.deepcopy(site_data["workers"]))
    
    return {
        "workers": ranked_workers,
        "gas_heatmap": site_data["gas_heatmap"],
        "rescue_teams": site_data["rescue_teams"],
        "collapsed_cells": site_data.get("collapsed_cells", []),
        "grid": SITES[site]["grid"],
        "is_simulating": live_state["is_simulating"],
        "site": site,
        "entry_points": SITES[site].get("entry_points", []),
        "exit_points": SITES[site].get("exit_points", []),
        "gas_origins": sim_engine.sites_state[site].get("gas_origins", [])
    }

@app.post("/api/simulation/start")
def start_sim():
    live_state["is_simulating"] = True
    log_event("SYSTEM", "info", "Simulation STARTED")
    return {"status": "ok"}

@app.post("/api/simulation/stop")
def stop_sim():
    live_state["is_simulating"] = False
    log_event("SYSTEM", "warning", "Simulation PAUSED")
    return {"status": "ok"}

@app.post("/api/dispatch")
def dispatch_rescue(site: str, team_id: str, target_worker_id: str):
    if site not in live_state["sites"]: return {"error": "Invalid site"}
    
    # Find worker location
    target_pos = None
    for w in live_state["sites"][site]["workers"]:
        if w["id"] == target_worker_id:
            target_pos = w["location"]
            break
            
    if target_pos:
        sim_engine.dispatch_team(site, team_id, target_pos)
        log_event(team_id, "info", f"Dispatched to {target_worker_id}", site)
        return {"status": "dispatched"}
    return {"error": "Worker not found"}

@app.get("/api/simulation/forecast/{worker_id}")
def get_forecast(worker_id: str, site: str = "Site A"):
    if site not in live_state["sites"]: return {"error": "Invalid site"}
    for w in live_state["sites"][site]["workers"]:
        if w["id"] == worker_id:
            # We need risks for forecast
            prioritized = compute_rescue_priorities([w])[0]
            return sim_engine.forecast_survival(prioritized)
    return {"error": "Not found"}


@app.post("/api/load_scenario")
def load_scenario(name: str = "gas_leak", site: str = "Site A"):
    if site not in live_state["sites"]: return {"error": "Invalid site"}
    
    # Reset site
    live_state["sites"][site]["workers"] = init_workers_for_site(site)
    live_state["sites"][site]["gas_heatmap"] = [[0.0 for _ in range(10)] for _ in range(8)]
    sim_engine.sites_state[site]["collapsed_cells"] = []
    live_state["sites"][site]["collapsed_cells"] = []
    
    if name == "explosion":
        sim_engine.trigger_gas_origin(site, 3, 3)
    elif name == "gas_leak":
        sim_engine.trigger_gas_origin(site, 1, 1)
    elif name == "collapse":
        grid = SITES[site]["grid"]
        for r in range(len(grid)):
            for c in range(len(grid[0])):
                if grid[r][c] == 1 and random.random() < 0.1:
                    sim_engine.sites_state[site]["collapsed_cells"].append((r, c))
        
    log_event("SYSTEM", "info", f"Scenario {name} applied to {site}", site)
    return {"status": "ok"}

@app.get("/api/events")
def get_events(site: str = "All"):
    if site == "All": return event_log[-20:]
    return [e for e in event_log if e["site"] == site or e["site"] == "All"][-20:]

@app.post("/api/command/send")
def send_command(worker_id: str, command: str, site: str = "Site A"):
    """Send a directive command to a worker (EVACUATE, STAY_PUT, STATUS_REPORT)"""
    if site not in live_state["sites"]: return {"error": "Invalid site"}
    
    worker = next((w for w in live_state["sites"][site]["workers"] if w["id"] == worker_id), None)
    if not worker: return {"error": "Worker not found"}

    level_map = {"EVACUATE": "warning", "STAY_PUT": "info", "STATUS_REPORT": "info"}
    level = level_map.get(command, "info")
    
    if command == "EVACUATE":
        worker["heart_rate"] = min(170.0, worker["heart_rate"] + 15.0)
        worker["oxygen_percent"] = max(8.0, worker["oxygen_percent"] - 1.0)
        worker["status"] = "EVACUATING"
        log_event(worker_id, level, f"Evacuation ordered for {worker_id}.", site)
    elif command == "STAY_PUT":
        worker["heart_rate"] = max(40.0, worker["heart_rate"] - 10.0)
        log_event(worker_id, level, f"Confirmed staying put. {worker_id} is conserving energy.", site)
    elif command == "STATUS_REPORT":
        condition = "Critical/Hurt" if worker.get("survival_probability", 1.0) < 0.4 else "Stable/Safe"
        log_event(worker_id, level, f"Status: {worker_id} is {condition}. HR: {worker['heart_rate']:.0f}, O2: {worker['oxygen_percent']:.1f}%", site)
    return {"status": "sent", "worker_id": worker_id, "command": command}

@app.websocket("/ws/live_status")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            advance_simulation()
            status = live_status("Site A")
            # Enrich payload so App.js and App.jsx both work
            status["elapsed_seconds"] = round((time.time() - DISASTER_START_TIME) * 4.0, 1)
            status["events"] = get_events("Site A")
            await websocket.send_json(status)
            await asyncio.sleep(0.25)
    except WebSocketDisconnect:
        pass
