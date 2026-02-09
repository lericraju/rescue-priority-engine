from backend.api.rescue_service import compute_rescue_priorities

if __name__ == "__main__":
    results = compute_rescue_priorities()
    for r in results:
        print(r)
