# Mine Layout Definitions
# 0 = Wall, 1 = Tunnel
# Grid: 8x10
# 5 workers per site (10 total)

SITES = {
    "Site A": {
        "grid": [
            [0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
            [0, 1, 1, 0, 1, 1, 1, 1, 1, 0],
            [1, 1, 0, 0, 0, 0, 1, 0, 1, 0],
            [1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
            [1, 1, 1, 0, 1, 0, 0, 0, 0, 1],
            [0, 0, 1, 1, 1, 0, 1, 1, 1, 1],
            [0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
        ],
        "workers": {
            "Worker_Alpha":   {"row": 0, "col": 2},
            "Worker_Beta":    {"row": 1, "col": 1},
            "Worker_Gamma":   {"row": 3, "col": 0},
            "Worker_Delta":   {"row": 5, "col": 4},
            "LIVE_SENSOR_01": {"row": 3, "col": 9}
        },
        "rescue_teams": [
            {"id": "Alpha_Team", "location": {"row": 0, "col": 4},  "status": "Ready"},
            {"id": "Bravo_Team", "location": {"row": 7, "col": 9},  "status": "Ready"}
        ],
        "entry_points": [{"row": 0, "col": 4}],
        "exit_points": [{"row": 7, "col": 9}]
    },
    "Site B": {
        "grid": [
            [1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
            [1, 0, 1, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
            [0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
            [1, 1, 1, 0, 1, 1, 1, 1, 0, 0],
            [1, 0, 0, 0, 1, 0, 0, 0, 0, 0]
        ],
        "workers": {
            "Worker_Theta":   {"row": 0, "col": 0},
            "Worker_Iota":    {"row": 2, "col": 0},
            "Worker_Kappa":   {"row": 4, "col": 3},
            "Worker_Lambda":  {"row": 6, "col": 6},
            "LIVE_SENSOR_02": {"row": 0, "col": 9}
        },
        "rescue_teams": [
            {"id": "Charlie_Team", "location": {"row": 0, "col": 5}, "status": "Ready"},
            {"id": "Delta_Team",   "location": {"row": 7, "col": 4}, "status": "Ready"}
        ],
        "entry_points": [{"row": 0, "col": 5}],
        "exit_points": [{"row": 7, "col": 4}]
    }
}

# For backward compatibility
MINE_GRID        = SITES["Site A"]["grid"]
WORKER_LOCATIONS = SITES["Site A"]["workers"]
RESCUE_TEAMS     = SITES["Site A"]["rescue_teams"]
