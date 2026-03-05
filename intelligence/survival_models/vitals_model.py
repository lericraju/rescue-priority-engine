def vitals_risk_score(heart_rate: int, immobile_minutes: int) -> float:
    """
    Estimates risk based on physiological signals.
    Higher score = higher risk.
    """

    risk = 0.0

    # Heart rate based risk
    if heart_rate < 50 or heart_rate > 120:
        risk += 0.4
    elif heart_rate < 60 or heart_rate > 100:
        risk += 0.2

    # Immobility based risk
    if immobile_minutes > 30:
        risk += 0.4
    elif immobile_minutes > 10:
        risk += 0.2

    return min(risk, 1.0)
