# System Architecture

The Rescue Priority Engine is a modular AI decision-support system designed
to assist rescue teams during underground mine disasters.

## Architecture Layers

### 1. Data Ingestion Layer
Parses wearable device data such as heart rate.

Modules:
- google_fit_parser.py

### 2. Intelligence Layer
Computes survival probability and rescue priority.

Modules:
- vitals_model.py
- gas_exposure.py
- hypoxia_model.py
- priority_engine.py

### 3. Backend Layer
Coordinates data ingestion and intelligence modules.

Modules:
- rescue_service.py
- demo_runner.py
- FastAPI server

### 4. Simulation Layer
Generates synthetic disaster scenarios.

Modules:
- synthetic_generator.py

### 5. Interface Layer
Provides visualization for rescue teams.

Interfaces:
- Streamlit dashboard
- React web interface
- Flutter mobile prototype
