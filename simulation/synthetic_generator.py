import random

def generate_worker(worker_id: int) -> dict:
    return {
        "id": f"Worker_{worker_id}",
        "heart_rate": random.randint(60, 120),
        "immobile_minutes": random.randint(0, 30),
        "gas_ppm": random.randint(20, 300),
        "gas_exposure_minutes": random.randint(0, 30),
        "oxygen_percent": round(random.uniform(9.0, 20.0), 1),
        "hypoxia_minutes": random.randint(0, 30),
    }


def generate_scenario(num_workers: int = 3) -> list:
    return [generate_worker(i + 1) for i in range(num_workers)]
