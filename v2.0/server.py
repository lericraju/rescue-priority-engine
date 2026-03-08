"""
server.py
---------
FastAPI backend for the LASTBREATH Rescue Priority Engine.

New in this version:
  - WebSocket /ws/simulation   -- streams live ticks to connected clients
  - POST /api/sim/start        -- start/reset simulation
  - POST /api/sim/pause        -- pause
  - POST /api/sim/resume       -- resume
  - POST /api/sim/speed        -- set speed multiplier
  - POST /api/sim/rescue       -- mark a worker as rescued
  - GET  /api/sim/snapshot     -- current state (REST fallback)

Original endpoints preserved for compatibility.
"""

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.api.rescue_service import get_priorities, compute_rescue_priorities
from simulation.synthetic_generator import generate_scenario
from simulation.disaster_simulation import DisasterSimulation

logging.basicConfig(level=logging.INFO)

# ─── Global simulation instance ───────────────────────────────────────────

sim = DisasterSimulation(num_workers=5)
connected_clients: list[WebSocket] = []


# ─── Background broadcast task ────────────────────────────────────────────

async def broadcast_loop():
    """Push a simulation tick to all connected WebSocket clients every 3s."""
    while True:
        await asyncio.sleep(DisasterSimulation.TICK_INTERVAL_SECONDS)

        if not connected_clients:
            continue

        snapshot = sim.tick()

        dead_clients = []
        for ws in connected_clients:
            try:
                await ws.send_json(snapshot)
            except Exception:
                dead_clients.append(ws)

        for ws in dead_clients:
            connected_clients.remove(ws)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(broadcast_loop())
    logging.info("Simulation broadcast loop started")
    yield
    task.cancel()


# ─── App ──────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Rescue Priority Engine API",
    description="""
AI-powered decision support system for prioritizing rescue operations
during underground mine disasters.

Features:
- Real-time disaster simulation with WebSocket streaming
- Physics-based oxygen, gas, and temperature progression
- Discrete disaster events (aftershocks, gas spikes, ventilation failures)
- Survival probability estimation and rescue prioritization
- Wearable data ingestion support
""",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health ───────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Rescue Priority Engine API v2.0 running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "rescue-priority-engine", "version": "2.0.0"}


# ─── WebSocket ────────────────────────────────────────────────────────────

@app.websocket("/ws/simulation")
async def websocket_simulation(websocket: WebSocket):
    """
    Real-time simulation stream.

    Connect from frontend:
        const ws = new WebSocket("ws://localhost:8000/ws/simulation");
        ws.onmessage = (e) => { const state = JSON.parse(e.data); ... }
    """
    await websocket.accept()
    connected_clients.append(websocket)
    logging.info(f"WebSocket client connected. Total: {len(connected_clients)}")

    await websocket.send_json(sim.snapshot())

    try:
        while True:
            await asyncio.sleep(30)
            await websocket.send_json({"type": "ping"})
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
        logging.info(f"WebSocket client disconnected. Total: {len(connected_clients)}")


# ─── Simulation control ───────────────────────────────────────────────────

@app.post("/api/sim/start")
def sim_start(num_workers: int = 5, seed: int = None):
    global sim
    sim = DisasterSimulation(num_workers=num_workers, seed=seed)
    return {"status": "started", "snapshot": sim.snapshot()}

@app.post("/api/sim/pause")
def sim_pause():
    sim.pause()
    return {"status": "paused"}

@app.post("/api/sim/resume")
def sim_resume():
    sim.resume()
    return {"status": "running"}

@app.post("/api/sim/speed")
def sim_speed(multiplier: float = 1.0):
    sim.set_speed(multiplier)
    return {"status": "ok", "speed_multiplier": multiplier}

class RescueRequest(BaseModel):
    worker_id: str

@app.post("/api/sim/rescue")
def sim_rescue(req: RescueRequest):
    sim.rescue_worker(req.worker_id)
    return {"status": "rescued", "worker_id": req.worker_id}

@app.get("/api/sim/snapshot")
def sim_snapshot():
    return sim.snapshot()


# ─── Legacy endpoints (preserved) ────────────────────────────────────────

@app.get("/api/priorities")
def priorities():
    logging.info("API request received for rescue priorities")
    return get_priorities()

@app.get("/api/simulate")
def simulate_disaster(num_workers: int = 3):
    logging.info("Generating one-shot synthetic scenario")
    workers = generate_scenario(num_workers)
    return compute_rescue_priorities(workers)
