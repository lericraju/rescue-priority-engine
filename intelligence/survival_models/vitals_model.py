def compute_vital_risk(worker):
    """
    Estimates physiological risk based on heart rate and immobility.
    Returns a value between 0 and 1.
    """

    heart_rate = worker.get("heart_rate", 80)
    immobile_minutes = worker.get("immobile_minutes", 0)

    hr_risk = min(abs(heart_rate - 80) / 80, 1)

    immobility_risk = min(immobile_minutes / 30, 1)

    vital_risk = (hr_risk + immobility_risk) / 2

    return vital_risk
