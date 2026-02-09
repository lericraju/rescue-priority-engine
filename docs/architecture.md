# System Architecture

The Rescue Priority Engine is designed as a layered system
to support rescue decision-making during underground mine disasters.

## Intelligence Layer
- Computes survival probability
- Ranks trapped workers by rescue priority
- Operates independently of UI and network layers

## Backend Coordination Layer
- Exposes intelligence outputs through APIs
- Manages scenario selection and demo flow
- Contains no decision logic

## Interface Layer
- React dashboard for command-center visualization
- Flutter mobile interface for field demonstration

## Simulation Layer
- Generates synthetic disaster scenarios
- Simulates environmental stress and time-based decay
