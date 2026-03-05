def prioritize_workers(workers: list) -> list:
    """
    Prioritizes rescue targets based on survival probability.
    Higher survival probability = higher rescue priority.
    """

    # Defensive copy to avoid mutating input
    ranked = sorted(
        workers,
        key=lambda w: w["survival_probability"],
        reverse=True
    )

    # Assign priority rank
    for idx, worker in enumerate(ranked, start=1):
        worker["priority"] = idx

    return ranked
