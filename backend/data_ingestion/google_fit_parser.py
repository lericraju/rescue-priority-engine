import json


def parse_fastrack_heart_rate(file_path: str) -> list:
    """
    Parse Google Takeout heart rate JSON from a Fastrack device
    and convert it into a worker profile for the rescue engine.
    """

    try:
        with open(file_path, "r") as f:
            data = json.load(f)
    except FileNotFoundError:
        raise FileNotFoundError(f"Heart rate file not found: {file_path}")
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON format in heart rate export file")

    heart_rates = []

    for point in data.get("Data Points", []):
        try:
            bpm = point["fitValue"][0]["value"]["fpVal"]
            heart_rates.append(bpm)
        except (KeyError, IndexError, TypeError):
            continue

    if not heart_rates:
        raise ValueError("No heart rate data found in Google Takeout file.")

    # Aggregate statistics
    avg_hr = sum(heart_rates) / len(heart_rates)
    max_hr = max(heart_rates)

    worker = {
        "id": "Fastrack_User",
        "heart_rate": round(avg_hr),

        # Placeholder environmental + activity data
        "immobile_minutes": 10,
        "gas_ppm": 150,
        "gas_exposure_minutes": 12,
        "oxygen_percent": 15.0,
        "hypoxia_minutes": 18,
    }

    return [worker]
