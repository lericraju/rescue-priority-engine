import json

def parse_fastrack_heart_rate(file_path: str) -> list:

    with open(file_path, "r") as f:
        data = json.load(f)

    heart_rates = []

    for point in data.get("Data Points", []):
        try:
            bpm = point["fitValue"][0]["value"]["fpVal"]
            heart_rates.append(bpm)
        except (KeyError, IndexError):
            continue

    if not heart_rates:
        raise ValueError("No heart rate data found")

    avg_hr = sum(heart_rates) / len(heart_rates)

    worker = {
        "id": "Fastrack_User",
        "heart_rate": round(avg_hr),
        "immobile_minutes": 10,
        "gas_ppm": 150,
        "gas_exposure_minutes": 12,
        "oxygen_percent": 15.0,
        "hypoxia_minutes": 18,
    }

    return [worker]