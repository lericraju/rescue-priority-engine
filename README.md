# Rescue Priority Engine

# LASTBREATH

## Overview
Rescue Priority Engine is a prototype decision-support system designed to assist rescue teams during underground mine disasters.  
The system computes survival probability estimates for trapped workers and dynamically prioritizes rescue order using physiological proxies and simulated environmental conditions.

The focus of this project is **decision-making under uncertainty**, not hardware deployment.

---

## Problem Statement
During mine disasters such as collapses, explosions, or ventilation failures, rescue teams face:
- Limited time and oxygen
- Incomplete and degrading information
- Inability to rescue all trapped workers simultaneously

Most existing systems focus on detection and monitoring, but **do not assist in deciding whom to rescue first**.

This project addresses that gap by introducing a structured rescue prioritization engine.

---

## Solution Approach
The system estimates a **dynamic survival probability** for each trapped worker and ranks rescue priorities based on:
- Physiological condition (heart rate, movement/immobility)
- Simulated environmental stress (oxygen depletion, gas exposure)
- Rescue feasibility (accessibility and time constraints)

The prioritization updates continuously as conditions change.

---

## System Architecture
The project is structured into independent layers:

### 1. Intelligence Layer
- Computes survival probability and rescue priority
- Uses physiological proxies and simulated environmental data
- Fully decoupled from UI and network layers

### 2. Backend Coordination Layer (Django)
- Exposes APIs for intelligence outputs
- Manages scenario selection and demo flow
- Contains no decision logic

### 3. Interface Layer
- **React Dashboard:** Command-center visualization
- **Flutter App:** Simplified mobile view for field demonstration

### 4. Simulation Layer
- Generates synthetic disaster scenarios
- Simulates gas exposure, oxygen decay, and time-based stress

---

## Data Strategy
This project is a **prototype** and does not rely on specialized hardware.

### Physiological Data
- Obtained from consumer-grade smartwatches (e.g., heart rate and motion)
- Used as physiological **proxies**, not medical-grade measurements

### Environmental Data
- Simulated using decay and stress models
- Represents gas concentration, oxygen depletion, and temperature rise

The system is designed to operate with **noisy, incomplete, and degrading data**, reflecting real disaster conditions.


---

## Team Responsibilities
- **Member 1 (Intelligence Lead):** Survival modeling and rescue prioritization logic  
- **Member 2 (Backend & Simulation Lead):** Django APIs and synthetic disaster generation  
- **Member 3 (Interface & Documentation Lead):** React dashboard, Flutter app, and documentation  

Work is divided by system layers to ensure clear ownership and modular development.

---

## Project Scope
- Prototype-level system
- Focus on architecture, logic, and decision-making
- No real-time deployment claims
- No specialized hardware dependency

---

## Disclaimer
This project is intended for academic and demonstration purposes only.  
Final rescue decisions must always remain under human authority and established safety protocols.

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.




