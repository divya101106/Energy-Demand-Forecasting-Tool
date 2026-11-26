"""Synthetic Energy Demand Data Generator.

Generates realistic, deterministic 365-day energy demand time-series data
with trend, weekly seasonality, annual seasonality, realistic noise,
and deliberate anomaly spikes and drops.
"""
import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from app.config import settings

def generate_synthetic_energy_dataset() -> List[Dict[str, Any]]:
    """Generates 365 days of synthetic daily electricity demand observations.
    
    Uses a deterministic algorithm with fixed seed so results are 100% reproducible.
    Contains:
      - Baseline demand (approx 32,500 MW)
      - Long-term gradual growth trend
      - Weekly seasonality (lower on weekends, higher mid-week)
      - Annual seasonality (winter heating peak, summer cooling peak)
      - Normal pseudo-random variation
      - Injected demand spikes and drops for anomaly detection
    """
    # Deterministic pseudo-random number generator (linear congruential generator)
    # to avoid external dependencies if numpy/pandas are still compiling/importing
    state = settings.RANDOM_SEED
    def pseudo_rand() -> float:
        nonlocal state
        state = (state * 1664525 + 1013904223) % (2**32)
        return (state / (2**32)) - 0.5  # Returns float in [-0.5, 0.5]

    start_date = datetime.strptime(settings.START_DATE, "%Y-%m-%d")
    observations: List[Dict[str, Any]] = []

    # Defined deliberate anomaly indices (day index from 0 to 364)
    # day 45 (Feb 15): Winter Polar Vortex Cold Snap Spike (+23%)
    # day 105 (Apr 16): Spring Grid Interconnector Outage Drop (-22%)
    # day 198 (Jul 18): Midsummer Extreme Heatwave Cooling Surge (+26%)
    # day 240 (Aug 29): Late Summer Industrial Plant Maintenance Drop (-25%)
    # day 315 (Nov 12): Early Winter Cold Front Spike (+20%)
    # day 358 (Dec 25): Christmas Holiday Demand Curtailment Drop (-28%)
    deliberate_anomalies = {
        45: {"type": "Spike", "pct": 0.23, "severity": "High", "desc": "Extreme cold wave surge; residential & commercial heating peak"},
        105: {"type": "Drop", "pct": -0.22, "severity": "Medium", "desc": "Regional transmission line maintenance and industrial curtailment"},
        198: {"type": "Spike", "pct": 0.26, "severity": "High", "desc": "Severe heat dome event; peak cooling and HVAC loads"},
        240: {"type": "Drop", "pct": -0.25, "severity": "Medium", "desc": "Scheduled manufacturing shutdowns and mild weather lull"},
        315: {"type": "Spike", "pct": 0.20, "severity": "Medium", "desc": "Sudden seasonal transition cold front heating demand"},
        358: {"type": "Drop", "pct": -0.28, "severity": "High", "desc": "Statutory holiday grid-wide commercial and industrial shutdown"},
    }

    base = settings.BASELINE_DEMAND_MW

    for day_idx in range(settings.SYNTHETIC_DAYS):
        current_date = start_date + timedelta(days=day_idx)
        date_str = current_date.strftime("%Y-%m-%d")
        day_of_week = current_date.weekday()  # 0=Monday, 6=Sunday
        day_of_year = day_idx

        # 1. Long-term trend: slight annual growth +1.5% over the year
        trend_component = base * (settings.ANNUAL_GROWTH_RATE * (day_idx / 365.0))

        # 2. Weekly seasonality:
        # Mon-Fri: +4% to +8%; Sat: -12%; Sun: -18%
        weekly_factors = {
            0: 0.05,   # Monday
            1: 0.08,   # Tuesday
            2: 0.08,   # Wednesday
            3: 0.07,   # Thursday
            4: 0.04,   # Friday
            5: -0.12,  # Saturday
            6: -0.18,  # Sunday
        }
        weekly_seasonality = base * weekly_factors[day_of_week]

        # 3. Annual seasonality:
        # Two peaks: Winter peak (Jan/Feb) and Summer peak (July/Aug)
        # Using harmonic composition:
        # Primary winter-summer cycle (1-year period) + secondary 6-month cycle
        angle_1 = 2 * math.pi * (day_of_year / 365.0)
        angle_2 = 4 * math.pi * (day_of_year / 365.0)
        
        # Peak in winter (cos close to 1 around Jan 1) and summer secondary bump
        yearly_seasonality = base * (0.12 * math.cos(angle_1) + 0.06 * math.sin(angle_2 - 0.5))

        # 4. Expected smooth demand baseline (what standard baseline or Prophet fits)
        expected_demand = base + trend_component + weekly_seasonality + yearly_seasonality

        # 5. Stochastic noise (approx ±1.8% standard noise)
        noise = base * 0.035 * pseudo_rand()

        # 6. Check deliberate anomaly
        is_anomaly = False
        anomaly_type = None
        severity = None
        anomaly_desc = None
        actual_demand = expected_demand + noise

        if day_idx in deliberate_anomalies:
            is_anomaly = True
            info = deliberate_anomalies[day_idx]
            anomaly_type = info["type"]
            severity = info["severity"]
            anomaly_desc = info["desc"]
            # Apply deliberate injection
            actual_demand = expected_demand * (1.0 + info["pct"])

        # Baseline forecasted estimate (for comparison views)
        # Smooth modeled value with slight model imperfection
        forecasted_demand = expected_demand + (base * 0.008 * math.sin(angle_1 * 3))

        deviation_mw = actual_demand - expected_demand
        deviation_pct = (deviation_mw / expected_demand) * 100.0

        observations.append({
            "date": date_str,
            "day_index": day_idx,
            "actual_demand": round(actual_demand, 2),
            "expected_demand": round(expected_demand, 2),
            "forecasted_demand": round(forecasted_demand, 2),
            "trend": round(trend_component, 2),
            "weekly_seasonality": round(weekly_seasonality, 2),
            "yearly_seasonality": round(yearly_seasonality, 2),
            "is_anomaly": is_anomaly,
            "anomaly_type": anomaly_type,
            "severity": severity,
            "anomaly_desc": anomaly_desc,
            "deviation_mw": round(deviation_mw, 2),
            "deviation_pct": round(deviation_pct, 2),
        })

    return observations

# Singleton cached dataset
_SYNTHETIC_DATASET = generate_synthetic_energy_dataset()

def get_all_observations() -> List[Dict[str, Any]]:
    """Returns the immutable synthetic energy dataset."""
    return _SYNTHETIC_DATASET

def get_train_test_split() -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Returns the strict 70/30 chronological split of the dataset.
    
    First 70% of observations: Training period (no lookahead bias).
    Final 30% of observations: Evaluation/testing period.
    """
    data = get_all_observations()
    split_idx = int(len(data) * settings.TRAIN_SPLIT_RATIO)
    train_set = data[:split_idx]
    test_set = data[split_idx:]
    return train_set, test_set
