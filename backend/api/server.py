from fastapi import FastAPI
from backend.api.rescue_service import get_priorities
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
