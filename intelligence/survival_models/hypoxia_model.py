def compute_hypoxia_risk(worker):
    """
    Estimate hypoxia risk using clinical oxygen saturation thresholds.
    Returns value between 0 and 1.
    """
    oxygen_percent = worker.get("oxygen_percent", 21)
    hypoxia_minutes = worker.get("hypoxia_minutes", 0)

    # Clinical O2 thresholds
    if oxygen_percent >= 19.5:
        oxygen_risk = 0.0   # Normal atmosphere
    elif oxygen_percent >= 16.0:
        oxygen_risk = 0.3   # Mild hypoxia — impaired judgment
    elif oxygen_percent >= 14.0:
        oxygen_risk = 0.6   # Moderate — headache, dizziness, fainting risk
    elif oxygen_percent >= 10.0:
        oxygen_risk = 0.85  # Severe — unconsciousness possible
    else:
        oxygen_risk = 1.0   # Critical — rapidly fatal

    # Time-in-hypoxic-zone risk — non-linear acceleration after 20 min
    if hypoxia_minutes <= 10:
        time_risk = hypoxia_minutes / 60
    elif hypoxia_minutes <= 30:
        time_risk = 0.17 + ((hypoxia_minutes - 10) / 20) * 0.33
    else:
        time_risk = min(0.5 + ((hypoxia_minutes - 30) / 60) * 0.5, 1.0)

    hypoxia_risk = (oxygen_risk * 0.7) + (time_risk * 0.3)
    return min(hypoxia_risk, 1.0)

