from intelligence.prioritization.priority_engine import prioritize_workers
import logging

logging.basicConfig(level=logging.INFO)


def validate_worker(worker):
    """
    Validate required worker fields before prioritization.
    """

    required_fields = [
        "heart_rate",
        "gas_ppm",
        "oxygen_percent"
    ]

    for field in required_fields:
        if field not in worker:
            raise ValueError(f"Missing worker field: {field}")


def compute_rescue_priorities(workers):
    """
    Backend service that connects worker data
    to the intelligence prioritization engine.
    """

    logging.info("Validating worker data")

    for worker in workers:
        validate_worker(worker)

    logging.info("Running prioritization engine")

    ranked_workers = prioritize_workers(workers)

    logging.info("Prioritization complete")

    return ranked_workers


def get_priorities():
    """
    Demo dataset used for dashboard and API testing.
    """

    workers = [
        {
            "id": "Worker_A",
            "heart_rate": 92,
            "immobile_minutes": 6,
            "gas_ppm": 180,
            "gas_exposure_minutes": 12,
            "oxygen_percent": 14.5,
            "hypoxia_minutes": 20,
        },
        {
            "id": "Worker_B",
            "heart_rate": 110,
            "immobile_minutes": 18,
            "gas_ppm": 260,
            "gas_exposure_minutes": 25,
            "oxygen_percent": 11.0,
            "hypoxia_minutes": 30,
        }
    ]

    ranked = compute_rescue_priorities(workers)

    return ranked
