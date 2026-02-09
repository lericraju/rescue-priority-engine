def compute_survival_probability(
    vitals_risk: float,
    gas_risk: float,
    hypoxia_risk: float
) -> float:
    """
    Combines multiple risk scores into a survival probability.
    Higher probability = higher chance of survival.
    """

    # Weights reflect relative severity
    vitals_weight = 0.3
    gas_weight = 0.3
    hypoxia_weight = 0.4

    combined_risk = (
        vitals_weight * vitals_risk +
        gas_weight * gas_risk +
        hypoxia_weight * hypoxia_risk
    )

    survival_probability = 1.0 - combined_risk

    return max(0.0, min(survival_probability, 1.0))
