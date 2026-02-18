import json


def parse_heart_rate_export(file_path: str) -> list:
    """
    Parses Google Fit heart rate export JSON file
    and extracts simplified worker heart rate data.
    """

    with open(file_path, "r") as f:
        data = json.load(f)

    workers = []

    for entry in data.get("heart_rate_samples", []):
        workers.append({
            "id": entry.get("user_id", "Unknown"),
            "heart_rate": entry.get("bpm", 0),
            "immobile_minutes": entry.get("immobile_minutes", 0),
        })

    return workers
