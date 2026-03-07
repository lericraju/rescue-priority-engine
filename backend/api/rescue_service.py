from intelligence.prioritization.priority_engine import prioritize_workers

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
