import streamlit as st
import pandas as pd

from backend.api.rescue_service import compute_rescue_priorities
from backend.data_ingestion.google_fit_parser import parse_fastrack_heart_rate


st.title("Mine Rescue Priority Dashboard")

st.write("Decision Support System for Rescue Teams")

workers = parse_fastrack_heart_rate("fastrack_heart_rate.json")

ranked = compute_rescue_priorities(workers)

st.subheader("Rescue Priority Results")

for w in ranked:
    st.write("Worker ID:", w["id"])
    st.write("Survival Probability:", round(w["survival_probability"], 2))
    st.write("Priority Rank:", w["priority"])
    st.write("---")


# --- Visualization Section (NEW) ---

st.subheader("Survival Probability Visualization")

df = pd.DataFrame(ranked)

if not df.empty:
    chart_data = df[["id", "survival_probability"]].set_index("id")
    st.bar_chart(chart_data)
