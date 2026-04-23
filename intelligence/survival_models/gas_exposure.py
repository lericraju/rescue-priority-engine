def compute_gas_risk(worker):
    """
    Estimate toxic gas exposure risk using cumulative dose (ppm * minutes).
    Returns value between 0 (safe) and 1 (critical).
    """
    gas_ppm = worker.get("gas_ppm", 0)
    exposure_minutes = worker.get("gas_exposure_minutes", 0)

    # Cumulative dose — more accurate toxicology model than raw ppm
    # OSHA 8h TWA for CO is 50 ppm; IDLH is 1200 ppm
    cumulative_dose = gas_ppm * exposure_minutes  # ppm-minutes
    dose_risk = min(cumulative_dose / 30000, 1.0)  # 30,000 ppm-min ≈ lethal threshold

    # Instantaneous concentration risk (immediate danger, even before cumulative)
    if gas_ppm < 50:
        instant_risk = 0.0
    elif gas_ppm < 200:
        instant_risk = 0.2
    elif gas_ppm < 500:
        instant_risk = 0.5
    elif gas_ppm < 1000:
        instant_risk = 0.8
    else:
        instant_risk = 1.0

    # Weighted: cumulative dose is the dominant factor
    gas_risk = (dose_risk * 0.65) + (instant_risk * 0.35)
    return min(gas_risk, 1.0)

