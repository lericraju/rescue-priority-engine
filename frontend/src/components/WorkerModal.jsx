import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { X, HeartPulse, Wind, AlertTriangle, Activity } from 'lucide-react';
import './WorkerModal.css';

const WorkerModal = ({ worker, history, onClose }) => {
  if (!worker) return null;

  const survivalPct = Math.round(worker.survival_probability * 100);
  const lowPct = Math.round((worker.survival_low || worker.survival_probability) * 100);
  const highPct = Math.round((worker.survival_high || worker.survival_probability) * 100);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">T+{label}s</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>{p.name}: {p.value?.toFixed(1)}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2>{worker.id}</h2>
            {worker.is_live && <span className="live-badge">LIVE SENSOR</span>}
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Summary stats */}
        <div className="modal-stats">
          <div className="modal-stat">
            <span className="modal-stat-label">Survival Probability</span>
            <span className="modal-stat-value large">{survivalPct}%</span>
            <span className="modal-stat-confidence">± {highPct - lowPct}% confidence</span>
          </div>
          <div className="modal-stat">
            <HeartPulse size={16} />
            <span className="modal-stat-label">Heart Rate</span>
            <span className="modal-stat-value">{Math.round(worker.heart_rate)} bpm</span>
          </div>
          <div className="modal-stat">
            <Wind size={16} />
            <span className="modal-stat-label">Oxygen</span>
            <span className="modal-stat-value">{worker.oxygen_percent?.toFixed(1)}%</span>
          </div>
          <div className="modal-stat">
            <AlertTriangle size={16} />
            <span className="modal-stat-label">Gas</span>
            <span className="modal-stat-value">{Math.round(worker.gas_ppm)} ppm</span>
          </div>
          <div className="modal-stat">
            <Activity size={16} />
            <span className="modal-stat-label">Rescue Rank</span>
            <span className="modal-stat-value large">#{worker.priority}</span>
          </div>
        </div>

        {/* Risk breakdown */}
        <div className="modal-risks">
          <div className="risk-bar-row">
            <span>Vital Risk</span>
            <div className="risk-bar-bg"><div className="risk-bar-fill" style={{width: `${Math.round((worker.vital_risk || 0) * 100)}%`, background: 'var(--accent-orange)'}}></div></div>
            <span>{Math.round((worker.vital_risk || 0) * 100)}%</span>
          </div>
          <div className="risk-bar-row">
            <span>Gas Risk</span>
            <div className="risk-bar-bg"><div className="risk-bar-fill" style={{width: `${Math.round((worker.gas_risk || 0) * 100)}%`, background: 'var(--accent-red)'}}></div></div>
            <span>{Math.round((worker.gas_risk || 0) * 100)}%</span>
          </div>
          <div className="risk-bar-row">
            <span>Hypoxia Risk</span>
            <div className="risk-bar-bg"><div className="risk-bar-fill" style={{width: `${Math.round((worker.hypoxia_risk || 0) * 100)}%`, background: 'var(--accent-cyan)'}}></div></div>
            <span>{Math.round((worker.hypoxia_risk || 0) * 100)}%</span>
          </div>
        </div>

        {/* Trend charts */}
        {history && history.length > 1 && (
          <div className="modal-charts">
            <h3 className="chart-section-title">Heart Rate History</h3>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="t" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[40, 180]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={120} stroke="rgba(249,115,22,0.4)" strokeDasharray="4 4" label={{ value: 'Tachycardia', fill: '#f97316', fontSize: 10 }} />
                <ReferenceLine y={60} stroke="rgba(6,182,212,0.4)" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="heart_rate" stroke="var(--accent-red)" dot={false} strokeWidth={2} name="HR (bpm)" />
              </LineChart>
            </ResponsiveContainer>

            <h3 className="chart-section-title">Oxygen % History</h3>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="t" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[8, 22]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={19.5} stroke="rgba(16,185,129,0.4)" strokeDasharray="4 4" label={{ value: 'Normal', fill: '#10b981', fontSize: 10 }} />
                <ReferenceLine y={16} stroke="rgba(249,115,22,0.4)" strokeDasharray="4 4" label={{ value: 'Hypoxia', fill: '#f97316', fontSize: 10 }} />
                <Line type="monotone" dataKey="oxygen_percent" stroke="var(--accent-cyan)" dot={false} strokeWidth={2} name="O₂ %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerModal;
