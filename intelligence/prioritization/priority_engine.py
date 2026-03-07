from intelligence.survival_models.vitals_model import compute_vital_risk
from intelligence.survival_models.gas_exposure import compute_gas_risk
from intelligence.survival_models.hypoxia_model import compute_hypoxia_risk
from intelligence.survival_models.survival_probability import compute_survival_probability


def prioritize_workers(workers):

    for worker in workers:

        vital_risk = compute_vital_risk(worker)
        gas_risk = compute_gas_risk(worker)
        hypoxia_risk = compute_hypoxia_risk(worker)

        worker["survival_probability"] = compute_survival_probability(
            vital_risk,
            gas_risk,
            hypoxia_risk
        )

    ranked = sorted(
        workers,
        key=lambda w: w["survival_probability"],
        reverse=True
    )

    for i, w in enumerate(ranked):
        w["priority"] = i + 1

    return ranked
