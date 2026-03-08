from fastapi import FastAPI
from backend.api.rescue_service import get_priorities, compute_rescue_priorities
from simulation.synthetic_generator import generate_scenario
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Rescue Priority Engine API",
    description="API for computing rescue priorities during mine disasters",
    version="1.0"
)


@app.get("/")
def root():
    return {
        "message": "Rescue Priority Engine API running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "rescue-priority-engine"
    }


@app.get("/api/priorities")
def priorities():
    logging.info("API request received for rescue priorities")

    ranked = get_priorities()

    return ranked


@app.get("/api/simulate")
def simulate_disaster(num_workers: int = 3):
    """
    Generate a synthetic disaster scenario and compute rescue priorities.
    """

    logging.info("Generating synthetic disaster scenario")

    workers = generate_scenario(num_workers)

    logging.info("Running prioritization on simulated workers")

    ranked = compute_rescue_priorities(workers)

    return ranked
