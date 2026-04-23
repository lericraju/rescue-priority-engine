import math


def _logistic(x, steepness=8, midpoint=0.55):
    """Smooth S-curve mapping risk [0,1] to survival [0,1]."""
    return 1.0 / (1.0 + math.exp(steepness * (x - midpoint)))


def compute_survival_probability(vital_risk, gas_risk, hypoxia_risk, rescue_feasibility=0.5):
    """
    Combine risk scores into a survival probability.
    Uses weighted combination + logistic transformation for realistic output.
    Returns (probability, low_bound, high_bound).
    """
    # Evidence-based weights: hypoxia is the fastest killer in mine environments
    weighted_risk = (
        vital_risk     * 0.25 +
        gas_risk       * 0.30 +
        hypoxia_risk   * 0.35 +
        (1.0 - rescue_feasibility) * 0.10  # harder to reach = lower survival
    )

    # Logistic transform: avoids artificially high or low clipping
    probability = _logistic(weighted_risk)

    # Confidence interval — wider when data quality is uncertain
    # We use the spread of the three risk inputs as a proxy for uncertainty
    risk_spread = max(vital_risk, gas_risk, hypoxia_risk) - min(vital_risk, gas_risk, hypoxia_risk)
    uncertainty = 0.04 + (risk_spread * 0.12)  # 4–16% band

    low  = max(0.0, probability - uncertainty)
    high = min(1.0, probability + uncertainty)

    return probability, low, high

