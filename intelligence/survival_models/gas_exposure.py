def gas_risk_score(gas_ppm: int, exposure_minutes: int) -> float:
    """
    Estimates risk due to toxic gas exposure.
    Higher score = higher risk.
    """

    risk = 0.0

    # Gas concentration risk
    if gas_ppm > 300:
        risk += 0.5
    elif gas_ppm > 150:
        risk += 0.3
    elif gas_ppm > 50:
        risk += 0.1

    # Exposure duration risk
    if exposure_minutes > 30:
        risk += 0.4
    elif exposure_minutes > 10:
        risk += 0.2

    return min(risk, 1.0)
