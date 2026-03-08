"""
disaster_simulation.py
----------------------
Real-time mine disaster simulation engine.

Replaces the static random generator with a physics-inspired,
time-progressing model. Each tick (default: 5s real-time = 1 sim minute)
advances the disaster state based on:

  - Oxygen depletion curves (exponential decay per sealed zone)
  - Gas accumulation (CO/CH4 leak rate per zone)
  - Worker physiological response to environment
  - Random discrete events (aftershock, ventilation failure, rescue team progress)

This module is owned by the Backend & Simulation lead (Mohammed Yusuf).
"""

import random
import time
import math
import logging
from copy import deepcopy
from dataclasses import dataclass, field, asdict
from typing import Optional

logging.basicConfig(level=logging.INFO)


# ─── Zone definitions ──────────────────────────────────────────────────────

ZONES = {
    "Shaft A-1": {"depth": 167, "volume_m3": 420,  "sealed": False, "ventilation": 0.8},
    "Shaft A-2": {"depth": 198, "volume_m3": 380,  "sealed": False, "ventilation": 0.6},
    "Shaft B-4": {"depth": 320, "volume_m3": 290,  "sealed": True,  "ventilation": 0.0},
    "Shaft C-1": {"depth": 145, "volume_m3": 510,  "sealed": False, "ventilation": 0.9},
    "Tunnel E-7":{"depth": 280, "volume_m3": 180,  "sealed": True,  "ventilation": 0.0},
}

# ─── Event definitions ─────────────────────────────────────────────────────

EVENTS = [
    {"type": "aftershock",           "prob_per_tick": 0.04, "description": "Secondary collapse detected in sector"},
    {"type": "ventilation_failure",  "prob_per_tick": 0.03, "description": "Ventilation fan failure reported"},
    {"type": "gas_leak_spike",       "prob_per_tick": 0.05, "description": "Gas leak spike detected"},
    {"type": "rescue_team_advance",  "prob_per_tick": 0.08, "description": "Rescue team advanced 12m toward target"},
    {"type": "worker_signal",        "prob_per_tick": 0.06, "description": "Worker distress signal received"},
    {"type": "temperature_spike",    "prob_per_tick": 0.03, "description": "Thermal anomaly detected near shaft junction"},
]


# ─── Data classes ──────────────────────────────────────────────────────────

@dataclass
class ZoneState:
    name: str
    depth: int
    oxygen_percent: float       = 20.9
    co_ppm: float               = 0.0
    ch4_ppm: float              = 0.0
    temperature_c: float        = 28.0
    sealed: bool                = False
    ventilation_rate: float     = 0.8   # 0 = none, 1 = full
    rescue_distance_m: float    = 100.0 # metres until rescue team arrives

    def total_gas_ppm(self) -> float:
        return self.co_ppm + self.ch4_ppm


@dataclass
class WorkerState:
    id: str
    name: str
    zone: str
    depth: int

    # Physiological
    heart_rate: float           = 80.0
    immobile_minutes: float     = 0.0
    conscious: bool             = True
    stress_level: float         = 0.3   # 0–1

    # Exposure accumulators
    gas_exposure_minutes: float = 0.0
    hypoxia_minutes: float      = 0.0

    # Computed each tick
    survival_probability: float = 1.0
    priority: int               = 0
    status: str                 = "STABLE"

    # History for sparklines (last 20 ticks)
    survival_history: list      = field(default_factory=list)
    heart_rate_history: list    = field(default_factory=list)


@dataclass
class SimulationState:
    tick: int                   = 0
    sim_minutes_elapsed: float  = 0.0
    real_time_start: float      = field(default_factory=time.time)
    zones: dict                 = field(default_factory=dict)
    workers: list               = field(default_factory=list)
    events_log: list            = field(default_factory=list)  # last 10 events
    disaster_severity: float    = 0.4   # 0–1, grows over time
    running: bool               = True
    paused: bool                = False
    speed_multiplier: float     = 1.0   # 1x, 2x, 5x


# ─── Simulation engine ────────────────────────────────────────────────────

class DisasterSimulation:
    """
    Stateful, tick-based real-time mine disaster simulation.

    Usage:
        sim = DisasterSimulation(num_workers=5)
        sim.start()

        # In your API tick loop:
        state = sim.tick()
        # Returns serializable snapshot of current state

        sim.pause()
        sim.resume()
        sim.reset()
    """

    TICK_INTERVAL_SECONDS = 3.0     # Real-time seconds per tick
    SIM_MINUTES_PER_TICK  = 1.0     # Simulated time advance per tick

    WORKER_NAMES = [
        "Rajan Mehta", "Arjun Sharma", "Dev Patel", "Suresh Kumar",
        "Priya Nair",  "Amit Verma",   "Neha Singh", "Rahul Gupta",
        "Kavya Reddy", "Sanjay Patil", "Deepa Iyer", "Manoj Tiwari",
    ]

    def __init__(self, num_workers: int = 5, seed: Optional[int] = None):
        if seed is not None:
            random.seed(seed)

        self.num_workers = min(num_workers, len(self.WORKER_NAMES))
        self.state = self._init_state()
        logging.info(f"DisasterSimulation initialised: {self.num_workers} workers")

    # ── Initialisation ────────────────────────────────────────────────────

    def _init_state(self) -> SimulationState:
        zones = {
            name: ZoneState(
                name=name,
                depth=meta["depth"],
                oxygen_percent=random.uniform(17.0, 20.5),
                co_ppm=random.uniform(0, 60),
                ch4_ppm=random.uniform(0, 40),
                temperature_c=random.uniform(26, 32),
                sealed=meta["sealed"],
                ventilation_rate=meta["ventilation"],
                rescue_distance_m=random.uniform(60, 140),
            )
            for name, meta in ZONES.items()
        }

        zone_names = list(zones.keys())
        names = random.sample(self.WORKER_NAMES, self.num_workers)

        workers = []
        for i, name in enumerate(names):
            zone = zone_names[i % len(zone_names)]
            w = WorkerState(
                id=f"W-{str(i+1).zfill(3)}",
                name=name,
                zone=zone,
                depth=zones[zone].depth,
                heart_rate=random.uniform(75, 100),
                immobile_minutes=random.uniform(0, 8),
                stress_level=random.uniform(0.2, 0.5),
                gas_exposure_minutes=random.uniform(0, 10),
                hypoxia_minutes=random.uniform(0, 5),
            )
            workers.append(w)

        return SimulationState(zones=zones, workers=workers)

    # ── Public API ────────────────────────────────────────────────────────

    def tick(self) -> dict:
        """Advance simulation by one tick. Returns serialisable snapshot."""
        if self.state.paused:
            return self.snapshot()

        self.state.tick += 1
        self.state.sim_minutes_elapsed += self.SIM_MINUTES_PER_TICK * self.state.speed_multiplier
        self.state.disaster_severity = min(1.0, self.state.disaster_severity + 0.003)

        self._tick_zones()
        self._tick_workers()
        self._tick_events()
        self._prioritize()

        return self.snapshot()

    def pause(self):
        self.state.paused = True

    def resume(self):
        self.state.paused = False

    def reset(self, seed: Optional[int] = None):
        if seed is not None:
            random.seed(seed)
        self.state = self._init_state()

    def set_speed(self, multiplier: float):
        self.state.speed_multiplier = max(0.5, min(10.0, multiplier))

    def rescue_worker(self, worker_id: str):
        """Mark a worker as rescued — removes from active simulation."""
        self.state.workers = [w for w in self.state.workers if w.id != worker_id]
        self._log_event("rescue_complete", f"Worker {worker_id} successfully extracted", critical=False)

    def snapshot(self) -> dict:
        """Return a JSON-serialisable snapshot of current state."""
        return {
            "tick": self.state.tick,
            "sim_minutes_elapsed": round(self.state.sim_minutes_elapsed, 1),
            "disaster_severity": round(self.state.disaster_severity, 3),
            "paused": self.state.paused,
            "speed_multiplier": self.state.speed_multiplier,
            "workers": [self._worker_dict(w) for w in self.state.workers],
            "zones": {k: self._zone_dict(v) for k, v in self.state.zones.items()},
            "events_log": list(self.state.events_log[-10:]),
            "summary": self._summary(),
        }

    # ── Zone physics ──────────────────────────────────────────────────────

    def _tick_zones(self):
        for zone in self.state.zones.values():
            sev = self.state.disaster_severity
            speed = self.state.speed_multiplier

            # Oxygen depletion — faster in sealed zones, slowed by ventilation
            depletion_rate = (0.08 + sev * 0.06) * (1 - zone.ventilation_rate * 0.7) * speed
            zone.oxygen_percent = max(6.0, zone.oxygen_percent - depletion_rate)

            # CO accumulation — exponential in sealed zones
            co_rate = (1.2 + sev * 2.0) * (1.5 if zone.sealed else 0.6) * speed
            zone.co_ppm = min(800, zone.co_ppm + co_rate + random.uniform(-0.3, 0.3))

            # CH4 seepage
            ch4_rate = (0.8 + sev * 1.2) * (1.3 if zone.sealed else 0.4) * speed
            zone.ch4_ppm = min(600, zone.ch4_ppm + ch4_rate + random.uniform(-0.2, 0.2))

            # Temperature rise
            temp_rate = (0.02 + sev * 0.015) * speed
            zone.temperature_c = min(55, zone.temperature_c + temp_rate)

            # Rescue team advances (unless aftershock blocks them)
            rescue_rate = (2.0 + random.uniform(0, 1.5)) * speed
            zone.rescue_distance_m = max(0, zone.rescue_distance_m - rescue_rate)

    # ── Worker physiology ────────────────────────────────────────────────

    def _tick_workers(self):
        for w in self.state.workers:
            zone = self.state.zones.get(w.zone)
            if not zone:
                continue

            speed = self.state.speed_multiplier

            # Accumulate exposure time
            if zone.oxygen_percent < 16.0:
                w.hypoxia_minutes += self.SIM_MINUTES_PER_TICK * speed
            if zone.total_gas_ppm() > 50:
                w.gas_exposure_minutes += self.SIM_MINUTES_PER_TICK * speed

            # Immobility — workers who are critical tend to stop moving
            if w.survival_probability < 0.4:
                w.immobile_minutes += self.SIM_MINUTES_PER_TICK * speed * 0.9
            else:
                # Occasional movement
                if random.random() > 0.7:
                    w.immobile_minutes = max(0, w.immobile_minutes - 0.5)
                else:
                    w.immobile_minutes += self.SIM_MINUTES_PER_TICK * speed * 0.3

            # Heart rate responds to stress + hypoxia
            o2_stress    = max(0, (16 - zone.oxygen_percent) * 2.5)
            gas_stress   = min(20, zone.total_gas_ppm() / 40)
            target_hr    = 80 + o2_stress + gas_stress + w.stress_level * 15
            w.heart_rate += (target_hr - w.heart_rate) * 0.15 + random.uniform(-1.5, 1.5)
            w.heart_rate  = max(30, min(160, w.heart_rate))

            # Stress accumulates with environment
            env_stress = (1 - zone.oxygen_percent / 21) * 0.4 + (zone.total_gas_ppm() / 800) * 0.3
            w.stress_level = min(1.0, w.stress_level + env_stress * 0.02 * speed)

            # Consciousness — lost at extreme hypoxia or gas
            if zone.oxygen_percent < 8.5 or zone.total_gas_ppm() > 700:
                w.conscious = False
                w.immobile_minutes += self.SIM_MINUTES_PER_TICK * speed

            # Record history (keep last 20 ticks)
            w.survival_history.append(round(w.survival_probability, 3))
            w.heart_rate_history.append(round(w.heart_rate, 1))
            if len(w.survival_history)    > 20: w.survival_history.pop(0)
            if len(w.heart_rate_history)  > 20: w.heart_rate_history.pop(0)

    # ── Survival scoring ─────────────────────────────────────────────────

    def _prioritize(self):
        for w in self.state.workers:
            zone = self.state.zones.get(w.zone)
            gas_ppm = zone.total_gas_ppm() if zone else 0
            oxy     = zone.oxygen_percent  if zone else 21.0

            # Vitals risk
            hr_risk       = min(abs(w.heart_rate - 80) / 80, 1)
            immob_risk    = min(w.immobile_minutes / 60, 1)
            vital_risk    = (hr_risk + immob_risk) / 2

            # Gas risk
            ppm_risk      = min(gas_ppm / 500, 1)
            exp_risk      = min(w.gas_exposure_minutes / 60, 1)
            gas_risk      = (ppm_risk + exp_risk) / 2

            # Hypoxia risk
            oxy_risk      = min(max(0, (21 - oxy)) / 10, 1)
            time_risk     = min(w.hypoxia_minutes / 60, 1)
            hypoxia_risk  = (oxy_risk + time_risk) / 2

            total_risk    = (vital_risk + gas_risk + hypoxia_risk) / 3
            w.survival_probability = round(max(0.0, 1 - total_risk), 4)

            # Status label
            sp = w.survival_probability
            if   sp < 0.25: w.status = "CRITICAL"
            elif sp < 0.50: w.status = "DANGER"
            elif sp < 0.75: w.status = "MODERATE"
            else:           w.status = "STABLE"

        # Assign priority ranks (lowest survival = highest priority)
        sorted_workers = sorted(self.state.workers, key=lambda w: w.survival_probability)
        for i, w in enumerate(sorted_workers):
            w.priority = i + 1

    # ── Discrete events ─────────────────────────────────────────────────

    def _tick_events(self):
        for event in EVENTS:
            if random.random() < event["prob_per_tick"] * self.state.disaster_severity:
                self._handle_event(event)

    def _handle_event(self, event: dict):
        zone_name = random.choice(list(self.state.zones.keys()))
        zone      = self.state.zones[zone_name]
        etype     = event["type"]

        if etype == "aftershock":
            zone.sealed = True
            zone.ventilation_rate = max(0, zone.ventilation_rate - 0.3)
            zone.rescue_distance_m += random.uniform(15, 40)
            self._log_event(etype, f"{event['description']} — {zone_name} sealed", critical=True)

        elif etype == "ventilation_failure":
            zone.ventilation_rate = max(0, zone.ventilation_rate - random.uniform(0.2, 0.5))
            self._log_event(etype, f"{event['description']} — {zone_name}", critical=True)

        elif etype == "gas_leak_spike":
            zone.co_ppm  = min(800, zone.co_ppm  + random.uniform(30, 80))
            zone.ch4_ppm = min(600, zone.ch4_ppm + random.uniform(20, 60))
            self._log_event(etype, f"{event['description']} — {zone_name} +{random.randint(30,80)} ppm", critical=True)

        elif etype == "rescue_team_advance":
            zone.rescue_distance_m = max(0, zone.rescue_distance_m - random.uniform(8, 20))
            self._log_event(etype, f"{event['description']} — now {zone.rescue_distance_m:.0f}m from {zone_name}", critical=False)

        elif etype == "worker_signal":
            if self.state.workers:
                w = random.choice(self.state.workers)
                self._log_event(etype, f"Signal from {w.name} ({w.zone})", critical=False)

        elif etype == "temperature_spike":
            zone.temperature_c = min(55, zone.temperature_c + random.uniform(3, 8))
            self._log_event(etype, f"{event['description']} — {zone_name} now {zone.temperature_c:.1f}°C", critical=True)

    def _log_event(self, etype: str, message: str, critical: bool):
        self.state.events_log.append({
            "tick":     self.state.tick,
            "sim_time": round(self.state.sim_minutes_elapsed, 1),
            "type":     etype,
            "message":  message,
            "critical": critical,
        })
        logging.info(f"[SIM EVENT] {message}")

    # ── Serialisation helpers ─────────────────────────────────────────────

    def _worker_dict(self, w: WorkerState) -> dict:
        return {
            "id":                   w.id,
            "name":                 w.name,
            "zone":                 w.zone,
            "depth":                w.depth,
            "heart_rate":           round(w.heart_rate, 1),
            "immobile_minutes":     round(w.immobile_minutes, 1),
            "gas_exposure_minutes": round(w.gas_exposure_minutes, 1),
            "hypoxia_minutes":      round(w.hypoxia_minutes, 1),
            "stress_level":         round(w.stress_level, 3),
            "conscious":            w.conscious,
            "survival_probability": w.survival_probability,
            "status":               w.status,
            "priority":             w.priority,
            "survival_history":     w.survival_history,
            "heart_rate_history":   w.heart_rate_history,
        }

    def _zone_dict(self, z: ZoneState) -> dict:
        return {
            "name":               z.name,
            "depth":              z.depth,
            "oxygen_percent":     round(z.oxygen_percent, 2),
            "co_ppm":             round(z.co_ppm, 1),
            "ch4_ppm":            round(z.ch4_ppm, 1),
            "total_gas_ppm":      round(z.total_gas_ppm(), 1),
            "temperature_c":      round(z.temperature_c, 1),
            "sealed":             z.sealed,
            "ventilation_rate":   round(z.ventilation_rate, 2),
            "rescue_distance_m":  round(z.rescue_distance_m, 1),
        }

    def _summary(self) -> dict:
        workers = self.state.workers
        if not workers:
            return {"total": 0, "critical": 0, "danger": 0, "stable": 0, "avg_survival": 0}
        return {
            "total":        len(workers),
            "critical":     sum(1 for w in workers if w.status == "CRITICAL"),
            "danger":       sum(1 for w in workers if w.status == "DANGER"),
            "moderate":     sum(1 for w in workers if w.status == "MODERATE"),
            "stable":       sum(1 for w in workers if w.status == "STABLE"),
            "unconscious":  sum(1 for w in workers if not w.conscious),
            "avg_survival": round(sum(w.survival_probability for w in workers) / len(workers), 3),
        }
