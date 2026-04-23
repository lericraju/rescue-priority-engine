from intelligence.survival_models.vitals_model import vitals_risk_score
from intelligence.survival_models.gas_exposure import gas_risk_score
from intelligence.survival_models.hypoxia_model import hypoxia_risk_score
from intelligence.survival_models.survival_probability import (
    compute_survival_probability,
)


def estimate_survival(
    heart_rate: int,
    immobile_minutes: int,
    gas_ppm: int,
    gas_exposure_minutes: int,
    oxygen_percent: float,
    hypoxia_minutes: int,
) -> float:
    """
    Estimates survival probability for a single worker
    based on physiological and environmental conditions.
    """

    vitals_risk = vitals_risk_score(heart_rate, immobile_minutes)
    gas_risk = gas_risk_score(gas_ppm, gas_exposure_minutes)
    hypoxia_risk = hypoxia_risk_score(oxygen_percent, hypoxia_minutes)

    survival_probability = compute_survival_probability(
        vitals_risk,
        gas_risk,
        hypoxia_risk,
    )

    return survival_probability
