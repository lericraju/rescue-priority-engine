import streamlit as st
from backend.api.rescue_service import compute_rescue_priorities

st.set_page_config(page_title="Rescue Command Dashboard", layout="wide")

st.title("🚑 Rescue Priority Command Dashboard")

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

st.metric("Total Workers Monitored", len(ranked))

st.subheader("Worker Rescue Ranking")

for w in ranked:

    if w["priority"] == 1:
        st.error(f"🚨 PRIORITY 1 — {w['id']}")
    elif w["priority"] == 2:
        st.warning(f"⚠️ PRIORITY 2 — {w['id']}")
    else:
        st.success(f"✅ PRIORITY 3 — {w['id']}")

    col1, col2 = st.columns(2)

    with col1:
        st.write("**Heart Rate:**", w["heart_rate"], "bpm")
        st.write("**Oxygen Level:**", w["oxygen_percent"], "%")

    with col2:
        st.write("**Survival Probability:**", f"{w['survival_probability']:.2f}")
        st.write("**Gas Exposure (ppm):**", w["gas_ppm"])

    st.write("---")