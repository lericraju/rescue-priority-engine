import React from 'react';
import { HeartPulse, Wind, AlertTriangle, WifiOff } from 'lucide-react';
import './WorkerCard.css';

const WorkerCard = ({ worker, onClick }) => {
  const { 
    id, 
    is_live, 
    heart_rate, 
    gas_ppm, 
    oxygen_percent, 
    survival_probability,
    survival_low,
    survival_high,
    priority,
    signal_lost,
  } = worker;

  const survivalPct = Math.round(survival_probability * 100);
  const lowPct = Math.round((survival_low ?? survival_probability) * 100);
  const highPct = Math.round((survival_high ?? survival_probability) * 100);

  const isHypoxic = oxygen_percent < 19.5;
  const isGasDanger = gas_ppm > 200;
  const hrWarning = heart_rate > 120 || heart_rate < 50;

  return (
    <div 
      className={`worker-card ${is_live ? 'live-sensor-card' : ''} ${signal_lost ? 'signal-lost-card' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      title="Click for details"
    >
      {signal_lost && (
        <div className="signal-lost-overlay">
          <WifiOff size={22} />
          <span>SIGNAL LOST</span>
        </div>
      )}

      <div className="card-header">
        <div className="worker-id-group">
          <div className="id-site-row">
            <h3>{id}</h3>
            <span className="site-tag">{worker.site}</span>
          </div>
          {is_live && <span className="live-badge">LIVE SENSOR</span>}
        </div>
        <div className="priority-badge">Rank #{priority}</div>
      </div>

      <div className="survival-section">
        <div className="survival-label">Survival Probability</div>
        <div className="survival-bar-bg">
          <div 
            className={`survival-bar-fill ${survivalPct < 40 ? 'critical' : survivalPct < 70 ? 'warning' : 'safe'}`}
            style={{ width: `${survivalPct}%` }}
          />
        </div>
        <div className="survival-value-row">
          <span className="survival-confidence">±{highPct - lowPct}%</span>
          <span className="survival-value">{survivalPct}%</span>
        </div>
      </div>

      <div className="vitals-grid">
        <div className={`vital-item ${hrWarning ? 'alert' : ''}`}>
          <HeartPulse size={18} className="vital-icon" />
          <div className="vital-info">
            <span className="vital-label">Heart Rate</span>
            <span className="vital-value">{Math.round(heart_rate)} bpm</span>
          </div>
        </div>
        <div className={`vital-item ${isGasDanger ? 'alert-gas' : ''}`}>
          <AlertTriangle size={18} className="vital-icon" />
          <div className="vital-info">
            <span className="vital-label">Gas Level</span>
            <span className="vital-value">{Math.round(gas_ppm)} ppm</span>
          </div>
        </div>
        <div className={`vital-item ${isHypoxic ? 'alert-o2' : ''}`}>
          <Wind size={18} className="vital-icon" />
          <div className="vital-info">
            <span className="vital-label">Oxygen</span>
            <span className="vital-value">{oxygen_percent?.toFixed(1)}%</span>
          </div>
        </div>
        <div className={`vital-item ${worker.ttc < 15 ? 'alert' : ''}`}>
          <div className="vital-info">
            <span className="vital-label">TTC</span>
            <span className="vital-value">
              {worker.ttc > 120 ? 'STABLE' : `${Math.round(worker.ttc)}m`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;
