def hypoxia_risk_score(oxygen_percent: float, exposure_minutes: int) -> float:
    """
    Estimates risk due to oxygen deprivation (hypoxia).
    Higher score = higher risk.
    """

    risk = 0.0

    # Oxygen level risk
    if oxygen_percent < 10:
        risk += 0.6
    elif oxygen_percent < 15:
        risk += 0.4
    elif oxygen_percent < 19:
        risk += 0.2

    # Exposure duration risk
    if exposure_minutes > 30:
        risk += 0.4
    elif exposure_minutes > 10:
        risk += 0.2

    return min(risk, 1.0)
