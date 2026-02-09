from intelligence.inference import estimate_survival
from intelligence.prioritization.priority_engine import prioritize_workers
from simulation.synthetic_generator import generate_scenario


def compute_rescue_priorities():
    workers = generate_scenario()

    for w in workers:
        w["survival_probability"] = estimate_survival(
            w["heart_rate"],
            w["immobile_minutes"],
            w["gas_ppm"],
            w["gas_exposure_minutes"],
            w["oxygen_percent"],
            w["hypoxia_minutes"],
        )

    return prioritize_workers(workers)
