# Data Assumptions and Prototype Constraints

This project is implemented as a prototype focused on
architecture, decision logic, and rescue prioritization.

## Physiological Data
- Physiological inputs such as heart rate and movement
  are obtained from consumer-grade smartwatches
- These values are used as proxies to estimate worker condition
- Data is assumed to be noisy and incomplete

## Environmental Data
- Environmental conditions such as gas concentration,
  oxygen depletion, and temperature are simulated
- Simulation follows time-based decay and stress models
- No real-time industrial sensors are used

## Design Philosophy
- The system is designed to operate under uncertainty
- Decision logic does not depend on perfect data
- Hardware procurement is intentionally out of scope

This approach aligns with academic prototyping
and demonstration-focused system design.
