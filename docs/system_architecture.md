# System Architecture

The Rescue Priority Engine is designed as a modular decision-support system
for prioritizing rescue operations during underground mine disasters.

## Architecture Overview

The system consists of four major layers:

1. Data Ingestion Layer
2. Backend Coordination Layer
3. Intelligence Layer
4. Interface Layer

---

## Data Flow

Wearable Sensor Data
↓
Google Fit Export
↓
Data Ingestion Parser
↓
Backend Coordination Service
↓
Intelligence Engine
↓
Survival Probability Estimation
↓
Rescue Priority Ranking
↓
Visualization Dashboard / Mobile Interface

---

## Layer Responsibilities

### Intelligence Layer
Responsible for survival modelling and rescue prioritization.

Components:
- Vitals Risk Model
- Gas Exposure Model
- Hypoxia Risk Model
- Survival Probability Model
- Priority Engine

---

### Backend Coordination Layer
Responsible for connecting data ingestion and intelligence modules.

Components:
- Rescue Service
- Execution Runner
- Simulation Generator

---

### Data Ingestion Layer
Responsible for parsing wearable device exports.

Components:
- Google Fit Parser
- Fastrack Heart Rate Integration

---

### Interface Layer
Responsible for presenting rescue priorities to users.

Components:
- Streamlit Dashboard
- React Web Interface
- Flutter Mobile Prototype

---

## Design Principles

- Modular architecture
- Separation of concerns
- Explainable decision models
- Simulation support for testing
