from intelligence.survival_models.survival_probability import compute_survival_probability


def prioritize_workers(workers):
    """
    Computes survival probability for each worker
    and ranks them by rescue priority.
    """

    for worker in workers:
        worker["survival_probability"] = compute_survival_probability(worker)

    ranked = sorted(
        workers,
        key=lambda w: w["survival_probability"],
        reverse=True
    )

    for i, w in enumerate(ranked):
        w["priority"] = i + 1

    return ranked
