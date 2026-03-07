import streamlit as st
import pandas as pd

from backend.api.rescue_service import compute_rescue_priorities
from backend.data_ingestion.google_fit_parser import parse_fastrack_heart_rate


# Page configuration
st.set_page_config(
    page_title="Mine Rescue Decision Support",
    layout="centered"
)

# System header
st.header("Mine Disaster Decision Support System")
st.caption("AI-assisted rescue prioritization for trapped workers")


# Load worker data
workers = parse_fastrack_heart_rate("fastrack_heart_rate.json")

ranked = compute_rescue_priorities(workers)


# Results section
st.subheader("Rescue Priority Results")

for w in ranked:
    st.write("Worker ID:", w["id"])
    st.write("Survival Probability:", round(w["survival_probability"], 2))
    st.write("Priority Rank:", w["priority"])
    st.write("---")


# Visualization section
st.subheader("Survival Probability Visualization")

df = pd.DataFrame(ranked)

if not df.empty:
    chart_data = df[["id", "survival_probability"]].set_index("id")
    st.bar_chart(chart_data)
