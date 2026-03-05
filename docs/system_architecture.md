# System Architecture – Rescue Priority Engine

## Overview

The system is designed as a modular decision-support pipeline
for rescue prioritization during underground mine disasters.

---

## Architecture Layers

### 1. Data Layer
- Physiological data (heart rate, immobility)
- Environmental data (gas concentration, oxygen level)
- Data sourced via smartwatches and simulated conditions

---

### 2. Intelligence Layer
Responsible for survival estimation and rescue prioritization.

Modules:
- Vitals Risk Model
- Gas Exposure Risk Model
- Hypoxia Risk Model
- Survival Probability Aggregator
- Priority Ranking Engine

---

### 3. Backend Layer
Coordinates data processing and exposes computation services.

- Accepts worker data
- Calls intelligence module
- Returns ranked rescue order

---

### 4. Interface Layer (Planned)
- React Dashboard
- Flutter Mobile View

These provide visualization only and do not perform computation.

---

## Execution Flow

Smartwatch Data → Backend Service → Intelligence Layer → 
Survival Probability → Priority Ranking → Console Output
