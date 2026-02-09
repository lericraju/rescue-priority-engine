def generate_mock_disaster():
    """
    Generates a synthetic underground mine disaster scenario.
    Used for testing and demonstrating rescue prioritization logic.
    """

    workers = [
        {"worker_id": 1, "heart_rate": 92, "immobile_minutes": 5, "score": 0.78},
        {"worker_id": 2, "heart_rate": 110, "immobile_minutes": 15, "score": 0.52},
        {"worker_id": 3, "heart_rate": 60, "immobile_minutes": 30, "score": 0.31},
    ]

    return workers
