def compute_hypoxia_risk(worker):
    """
    Estimate hypoxia risk from oxygen depletion and exposure time.
    Returns value between 0 and 1.
    """

    oxygen_percent = worker.get("oxygen_percent", 21)
    hypoxia_minutes = worker.get("hypoxia_minutes", 0)

    oxygen_risk = min((21 - oxygen_percent) / 10, 1)

    time_risk = min(hypoxia_minutes / 60, 1)

    hypoxia_risk = (oxygen_risk + time_risk) / 2

    return hypoxia_risk
