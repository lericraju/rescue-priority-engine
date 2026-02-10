from backend.api.rescue_service import compute_rescue_priorities


def main():
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
        },
        {
            "id": "Worker_C",
            "heart_rate": 78,
            "immobile_minutes": 4,
            "gas_ppm": 90,
            "gas_exposure_minutes": 8,
            "oxygen_percent": 18.0,
            "hypoxia_minutes": 10,
        },
    ]

    ranked = compute_rescue_priorities(workers)

    print("\nRescue Priority Result:\n")
    for w in ranked:
        print(w)


if __name__ == "__main__":
    main()
