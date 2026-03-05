<div align="center">

# 🚨 LASTBREATH
### Rescue Priority Engine

> *A decision-support system for underground mine disaster rescue operations*

![Status](https://img.shields.io/badge/status-prototype-orange?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Purpose](https://img.shields.io/badge/purpose-academic%20%2F%20demo-lightgrey?style=flat-square)

</div>

---

## 📖 Overview

**LASTBREATH** is a prototype decision-support system designed to assist rescue teams during underground mine disasters. It computes survival probability estimates for trapped workers and dynamically prioritizes rescue order using physiological proxies and simulated environmental conditions.

> **Core focus:** Decision-making under uncertainty — not hardware deployment or field-ready rescue equipment.

---

## ❗ Problem Statement

During mine disasters (collapses, explosions, ventilation failures), rescue teams face:

- ⏱️ Limited time and oxygen availability
- 📡 Incomplete, unreliable, and rapidly degrading information
- 🚑 Inability to rescue all trapped workers simultaneously

Most existing systems focus on **detection and monitoring** — but offer little support for **rescue prioritization decisions**. LASTBREATH addresses this gap.

---

## 💡 Solution Approach

The system estimates a **dynamic survival probability** for each trapped worker and ranks rescue priorities using:

| Factor | Description |
|--------|-------------|
| 🫀 Physiological Condition | Heart rate and immobility duration |
| 🌫️ Environmental Stress | Oxygen depletion and gas exposure |
| 🛠️ Rescue Feasibility | Accessibility and operational constraints |

The prioritization model **continuously updates** as conditions change.

---

## 🏗️ System Architecture

The system is organized into four independent layers:

```
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
```

### Layer Breakdown

**🧠 1. Intelligence Layer**
- Computes survival probability and rescue priority rankings
- Uses physiological proxies and simulated environmental data
- Fully decoupled from UI and backend infrastructure

**⚙️ 2. Backend Coordination Layer (Django)**
- Provides APIs for intelligence layer outputs
- Handles system orchestration and scenario selection
- Contains **no** decision-making logic

**🖥️ 3. Interface Layer**
- **React Dashboard** — Command-center visualization
- **Flutter Mobile App** — Lightweight field-demo interface

**🔬 4. Simulation Layer**
- Generates synthetic disaster scenarios
- Simulates gas exposure, oxygen decay, and time-based survival stress

---

## 📊 Data Strategy

> This is a prototype system — no specialized rescue hardware required.

**Physiological Data** (from consumer wearables e.g. smartwatches)
- Heart rate
- Movement / immobility patterns
- Treated as *proxies*, not medical-grade measurements

**Environmental Data** (simulated via decay/stress models)
- Gas concentration levels
- Oxygen depletion
- Temperature rise
- Time-dependent survival degradation

The system is designed to operate with **noisy, incomplete, and degrading data** — reflecting real disaster environments.

---

## 📋 Example Output

```
Rescue Priority Result
======================

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
```

> ⚠️ Workers with **lower** survival probability are assigned **higher** rescue priority — ensuring limited rescue resources are deployed where they matter most.

---

## 👥 Team Responsibilities

| Member | Role | Responsibilities |
|--------|------|-----------------|
| Member 1 | Leric Raju (2409308) | Intelligence Lead | Survival modeling & rescue prioritization logic |
| Member 2 | Mohammed Yusuf (2410309)  | Backend & Simulation Lead | Django APIs & synthetic disaster generation |
| Member 3 | Tabish Matwankar (2410672) | Interface & Documentation Lead | React dashboard, Flutter app & documentation |

Responsibilities are divided by system layer for clear ownership and modular development.

---

## 🖥️ Interfaces

- **React Dashboard** — Rescue command visualization
- **Flutter Mobile Prototype** — Field-level access
- Designed for **rapid decision support** and clear priority visualization

---

## 🔭 Future Improvements

- [ ] Real-time wearable sensor integration
- [ ] Environmental IoT sensor inputs
- [ ] Dynamic rescue route optimization
- [ ] ML-based survival prediction models
- [ ] Real-time disaster simulation environments

---

## 📦 Current Status

This repository represents a **stable prototype** with working end-to-end execution of:

- ✅ Survival probability estimation
- ✅ Rescue prioritization logic
- ✅ Prototype visualization interfaces

---

## ⚠️ Disclaimer

This project is intended for **academic and demonstration purposes only.**
Final rescue decisions must always remain under **human authority** and established safety protocols.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
<sub>Built for decision-making under uncertainty · Not for field deployment</sub>
</div>
