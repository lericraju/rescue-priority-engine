def compute_vital_risk(worker):
    """
    Estimates physiological risk based on heart rate zone and immobility duration.
    Returns a value between 0 (safe) and 1 (critical).
    """
    heart_rate = worker.get("heart_rate", 80)
    immobile_minutes = worker.get("immobile_minutes", 0)

    # Heart rate zone classification
    if 60 <= heart_rate <= 100:
        hr_risk = 0.0  # Normal resting range
    elif heart_rate < 40 or heart_rate > 160:
        hr_risk = 1.0  # Life-threatening
    elif heart_rate < 50 or heart_rate > 140:
        hr_risk = 0.8  # Severe
    elif heart_rate < 60 or heart_rate > 120:
        hr_risk = 0.4  # Abnormal but not immediately critical
    else:
        hr_risk = 0.2  # Slightly elevated

    # Immobility risk — non-linear: accelerates after 45 min (unconsciousness threshold)
    if immobile_minutes <= 15:
        immobility_risk = immobile_minutes / 60
    elif immobile_minutes <= 45:
        immobility_risk = 0.25 + ((immobile_minutes - 15) / 30) * 0.4
    else:
        immobility_risk = min(0.65 + ((immobile_minutes - 45) / 60) * 0.35, 1.0)

    # Weighted: immobility carries slightly more weight (trapped = likely unconscious)
    vital_risk = (hr_risk * 0.4) + (immobility_risk * 0.6)
    return min(vital_risk, 1.0)

