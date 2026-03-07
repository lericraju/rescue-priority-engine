def get_priorities():
    workers = [
        {
            "id": "Worker_A",
            "heart_rate": 92,
            "immobile_minutes": 6,
            "gas_ppm": 180,
            "gas_exposure_minutes": 12,
            "oxygen_percent": 14.5,
            "hypoxia_minutes": 20,
        },
        {
            "id": "Worker_B",
            "heart_rate": 110,
            "immobile_minutes": 18,
            "gas_ppm": 260,
            "gas_exposure_minutes": 25,
            "oxygen_percent": 11.0,
            "hypoxia_minutes": 30,
        }
    ]

    ranked = compute_rescue_priorities(workers)

    return ranked
