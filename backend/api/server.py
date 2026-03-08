from fastapi import FastAPI
from backend.api.rescue_service import get_priorities, compute_rescue_priorities
from simulation.synthetic_generator import generate_scenario
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Rescue Priority Engine API",
    description="""
AI-powered decision support system for prioritizing rescue operations
during underground mine disasters.

Features:
- Survival probability estimation
- Rescue prioritization ranking
- Synthetic disaster scenario generation
- Wearable data ingestion support
""",
    version="1.0.0",
    contact={
        "name": "Rescue Priority Engine Team",
        "email": "research@mine-ai.org"
    },
    license_info={
        "name": "MIT License"
    }
)


@app.get("/")
def root():
    """
    Root endpoint to confirm the API is running.
    """
    return {
        "message": "Rescue Priority Engine API running"
    }


@app.get("/health")
def health_check():
    """
    Health check endpoint used for monitoring backend status.
    """
    return {
        "status": "healthy",
        "service": "rescue-priority-engine"
    }


@app.get("/api/priorities")
def priorities():
    """
    Return rescue priorities using the demo dataset.
    """
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
