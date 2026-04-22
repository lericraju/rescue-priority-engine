from intelligence.survival_models.vitals_model import compute_vital_risk
from intelligence.survival_models.gas_exposure import compute_gas_risk
from intelligence.survival_models.hypoxia_model import compute_hypoxia_risk
from intelligence.survival_models.survival_probability import compute_survival_probability


def prioritize_workers(workers):
    """
    Computes survival probability (with confidence interval) for each worker
    and returns them ranked by rescue priority (lowest survival = Rank 1).
    """
    for worker in workers:
        vital_risk = compute_vital_risk(worker)
        gas_risk = compute_gas_risk(worker)
        hypoxia_risk = compute_hypoxia_risk(worker)

        # rescue_feasibility: 0 = inaccessible, 1 = easily reachable
        # Each worker can have a static accessibility field; defaults to 0.5
        rescue_feasibility = worker.get("rescue_feasibility", 0.5)

        prob, low, high = compute_survival_probability(
            vital_risk,
            gas_risk,
            hypoxia_risk,
            rescue_feasibility
        )

        # Predictive Analytics: Time to Critical (TTC)
        # Estimated minutes until survival probability hits < 0.2
        # Simple heuristic: Higher total risk = lower TTC
        total_risk = (vital_risk + gas_risk + hypoxia_risk) / 3.0
        if total_risk > 0.1:
            # 1.0 risk -> ~10 mins, 0.1 risk -> ~100 mins
            ttc = max(1, round(10.0 / (total_risk ** 1.5), 1))
        else:
            ttc = 999.0 # Stable
            
        worker["survival_probability"] = round(prob, 4)
        worker["survival_low"]         = round(low, 4)
        worker["survival_high"]        = round(high, 4)
        worker["vital_risk"]           = round(vital_risk, 4)
        worker["gas_risk"]             = round(gas_risk, 4)
        worker["hypoxia_risk"]         = round(hypoxia_risk, 4)
        worker["ttc"]                  = ttc

    # Lowest survival probability → Rank #1 (rescued first)
    ranked = sorted(workers, key=lambda w: w["survival_probability"])

    for i, w in enumerate(ranked):
        w["priority"] = i + 1

    return ranked

