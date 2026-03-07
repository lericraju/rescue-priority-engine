def compute_survival_probability(vital_risk, gas_risk, hypoxia_risk):
    """
    Combine risk scores into survival probability.
    """

    total_risk = (vital_risk + gas_risk + hypoxia_risk) / 3

    survival_probability = max(0, 1 - total_risk)

    return survival_probability
