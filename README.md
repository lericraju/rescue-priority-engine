LASTBREATH — Rescue Priority Engine
Overview
Rescue Priority Engine is a prototype decision-support system designed to assist rescue teams during underground mine disasters.
The system computes survival probability estimates for trapped workers and dynamically prioritizes rescue order using physiological proxies and simulated environmental conditions.
The focus of this project is decision-making under uncertainty, not hardware deployment.

Problem Statement
During mine disasters such as collapses, explosions, or ventilation failures, rescue teams face:
Limited time and oxygen
Incomplete and degrading information
Inability to rescue all trapped workers simultaneously
Most existing systems focus on detection and monitoring, but do not assist in deciding whom to rescue first.
This project addresses that gap by introducing a structured rescue prioritization engine.

Solution Approach
The system estimates a dynamic survival probability for each trapped worker and ranks rescue priorities based on:
Physiological condition (heart rate, immobility)
Simulated environmental stress (oxygen depletion, gas exposure)
Rescue feasibility and accessibility
The prioritization updates continuously as conditions change.

System Architecture
The system is organized into independent layers to ensure modularity and scalability.
Intelligence Layer
Computes survival probability
Generates rescue priority ranking
Uses physiological proxies and environmental stress models
Fully decoupled from UI and backend services
Backend Coordination Layer
Handles system orchestration
Provides APIs for intelligence outputs
Manages simulation and data ingestion

Interface Layer
React Dashboard – Command center visualization
Flutter Mobile App – Lightweight mobile interface for field teams
Streamlit Dashboard – Prototype visualization interface for demo purposes

Simulation Layer
Generates synthetic disaster scenarios
Simulates oxygen decay, gas exposure, and stress progression

Architecture Flow
Wearable Device (Smartwatch)
            ↓
      Data Ingestion Layer
            ↓
      Intelligence Engine
  (Survival Probability Models)
            ↓
     Rescue Priority Engine
            ↓
        Backend APIs
            ↓
    Visualization Interfaces
 (Dashboard / Mobile / Command Center)
 
Data Strategy
This project is a prototype system and does not depend on specialized rescue hardware.
Physiological Data
Physiological signals are obtained from consumer-grade wearable devices such as smartwatches.
Example signals include:
Heart rate
Motion / immobility
These signals are treated as physiological proxies, not medical-grade measurements.

Environmental Data
Environmental conditions are simulated using decay and stress models representing:
Oxygen depletion
Gas concentration
Time-based survival degradation
The system is intentionally designed to operate with noisy, incomplete, and degrading data, reflecting real disaster environments.

Tech Stack
Core technologies used in the project:
Python – Core system implementation
Streamlit – Visualization dashboard
Django – Backend API layer
React – Command-center interface prototype
Flutter – Mobile interface prototype

Key engineering concepts:
Modular system architecture
Decision intelligence
Survival probability modeling
Data ingestion pipelines

Project Structure
rescue-priority-engine
│
├── intelligence
│   ├── survival_models
│   ├── prioritization
│   └── inference.py
│
├── backend
│   ├── api
│   ├── data_ingestion
│   └── demo_runner.py
│
├── simulation
│
├── frontend
│   └── react_dashboard
│
├── mobile
│   └── flutter_app
│
├── docs
│
├── dashboard.py
└── README.md

Running the Demo

Run Core Rescue Engine
python -m backend.demo_runner

This executes the rescue prioritization pipeline and prints the ranked rescue order.
Run Visualization Dashboard
streamlit run dashboard.py
This launches a lightweight rescue command dashboard displaying survival probability and rescue priority rankings.
Example Output

Example output from the rescue engine:
Rescue Priority Result

ID: Worker_B
Survival Probability: 0.49
Priority Rank: 1
-------------------------

ID: Worker_A
Survival Probability: 0.61
Priority Rank: 2
-------------------------

ID: Worker_C
Survival Probability: 0.89
Priority Rank: 3
-------------------------

The worker with the lowest survival probability receives the highest rescue priority.

Team Responsibilities
Member 1 – Intelligence Lead
Survival modeling, prioritization logic, and inference pipeline.
Member 2 – Backend & Simulation Lead
Django APIs, system orchestration, and synthetic disaster generation.
Member 3 – Interface & Documentation Lead
React dashboard, Flutter mobile interface, and system documentation.
Work is divided by system layers to maintain clear ownership and modular development.

Interfaces
The system supports multiple visualization layers:
React Dashboard – Rescue command center interface
Flutter Mobile App – Simplified field access interface
Streamlit Dashboard – Demonstration dashboard for system output
These interfaces display rescue priorities generated by the intelligence engine.

Project Scope
This project focuses on:
Prototype-level system design
Decision-support logic
Architecture and modularity
The project does not claim real-world deployment readiness.

Future Improvements
Possible extensions for future development:
Real-time wearable sensor integration
Environmental IoT sensor inputs
Dynamic rescue path optimization
Machine learning survival prediction models
Live disaster simulation environment

Disclaimer
This project is intended for academic and demonstration purposes only.
All real rescue operations must remain under human supervision and established safety protocols.

License
This project is licensed under the MIT License.
See the LICENSE file for details.

Current Status
This repository represents a stable prototype version of the Rescue Priority Engine with working end-to-end execution of:
Survival estimation
Rescue prioritization
Visualization of rescue rankings
