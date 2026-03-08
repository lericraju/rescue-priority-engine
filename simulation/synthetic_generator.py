import random
import logging

logging.basicConfig(level=logging.INFO)


def generate_worker(worker_id: int) -> dict:
    """
    Generate a synthetic worker profile for disaster simulation.
    """

    worker = {
        "id": f"Worker_{worker_id}",
        "heart_rate": random.randint(60, 120),
        "immobile_minutes": random.randint(0, 30),
        "gas_ppm": random.randint(20, 300),
        "gas_exposure_minutes": random.randint(0, 30),
        "oxygen_percent": round(random.uniform(9.0, 20.0), 1),
        "hypoxia_minutes": random.randint(0, 30),
    }

    return worker


def generate_scenario(num_workers: int = 3, seed: int | None = None) -> list:
    """
    Generate a synthetic mine disaster scenario.

    Parameters
    ----------
    num_workers : int
        Number of trapped workers to simulate.

    seed : int | None
        Random seed for reproducibility.

    Returns
    -------
    list
        List of simulated worker profiles.
    """

    if seed is not None:
        random.seed(seed)

    logging.info(f"Generating synthetic scenario for {num_workers} workers")

    workers = [generate_worker(i + 1) for i in range(num_workers)]

    logging.info("Scenario generation complete")

    return workers


if __name__ == "__main__":
    """
    Allows the simulation module to be run directly
    for quick testing of synthetic disaster scenarios.
    """

    scenario = generate_scenario(3)

    print("\nGenerated Disaster Scenario:\n")

    for worker in scenario:
        print(worker)
