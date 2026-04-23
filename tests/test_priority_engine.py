from intelligence.prioritization.priority_engine import prioritize_workers


def test_priority_sorting():
    workers = [
        {"id": "A", "survival_probability": 0.9},
        {"id": "B", "survival_probability": 0.5},
    ]

    ranked = prioritize_workers(workers)

    assert ranked[0]["id"] == "A"
    assert ranked[1]["id"] == "B"
