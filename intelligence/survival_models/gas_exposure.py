def compute_gas_risk(worker):
    """
    Estimate toxic gas exposure risk.
    Returns value between 0 (safe) and 1 (critical).
    """

    gas_ppm = worker.get("gas_ppm", 0)
    exposure_minutes = worker.get("gas_exposure_minutes", 0)

    ppm_risk = min(gas_ppm / 500, 1)
    exposure_risk = min(exposure_minutes / 60, 1)

    gas_risk = (ppm_risk + exposure_risk) / 2

    return gas_risk
