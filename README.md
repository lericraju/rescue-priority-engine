# Rescue Priority Engine

# LASTBREATH

## Overview
Rescue Priority Engine is an offline-first decision support system designed for underground mine disaster scenarios.  
It computes real-time survival probabilities of trapped workers and dynamically ranks rescue priorities based on physiological signals, environmental conditions, and rescue feasibility constraints.

The system is built for zero-connectivity, high-uncertainty environments where human decision-making is time-critical and error-prone.

---

## Problem Statement
During underground mine disasters, rescue teams face severe constraints:
- Limited time and oxygen
- Incomplete or degrading information
- Inability to rescue all trapped workers simultaneously

Current systems focus on detection and monitoring, but **do not provide quantitative guidance on whom to rescue first**.

This leads to delayed decisions, inefficient rescue paths, and avoidable loss of life.

---

## Solution
Rescue Priority Engine addresses this gap by:
- Estimating survival probability decay for each trapped worker
- Evaluating rescue feasibility under dynamic constraints
- Continuously re-ranking rescue priorities as conditions evolve

The system prioritizes **maximizing total survivability**, not just locating victims.

---

## Key Features
- Offline-first, edge-deployable architecture  
- Dynamic survival probability estimation  
- Rescue feasibility-aware prioritization  
- Sensor fusion from physiological and environmental inputs  
- Robust operation under partial or missing data  
- Designed for mine-specific adaptation over time  

---

## System Architecture
The system follows a disaster-first architecture:

- **Wearable / Edge Layer**
  - Collects physiological and environmental signals
  - Performs local survival probability inference

- **Mesh Communication Layer**
  - Exchanges compressed state data using short-range communication
  - Operates without internet connectivity

- **Command Interface**
  - Displays ranked rescue priorities
  - Updates dynamically as new data arrives

Mobile devices act as visualization and coordination tools, not as critical computation nodes.

---

## Data & Training Approach
Due to the rarity and ethical constraints of real disaster data, the system uses a hybrid intelligence strategy:

- Physics- and physiology-based survival models
- Synthetic disaster simulations for pre-training
- Online adaptation using mine-specific operational data
- Post-incident and drill-based feedback for calibration

This ensures functionality from first deployment while improving accuracy over time.

---

## Repository Structure

