import React, { useState } from 'react';
import './ScenarioSelector.css';

const SCENARIOS = [
  { name: 'gas_leak',   label: 'Gas Leak',           emoji: '🟡', desc: 'Toxic gas buildup across tunnel sections' },
  { name: 'explosion',  label: 'Explosion',           emoji: '💥', desc: 'Blast event — severe trauma and smoke' },
  { name: 'collapse',   label: 'Structural Collapse', emoji: '🪨', desc: 'Cave-in — immobility and trapped workers' },
];

const ScenarioSelector = ({ onScenarioLoad }) => {
  const [loading, setLoading] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);

  const loadScenario = async (name) => {
    setLoading(name);
    try {
      const res = await fetch(`https://rescue-priority-engine.onrender.com/api/load_scenario?name=${name}`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'ok') {
        setActiveScenario(name);
        onScenarioLoad && onScenarioLoad(name);
      }
    } catch (e) {
      console.error('Failed to load scenario:', e);
    }
    setLoading(null);
  };

  return (
    <div className="scenario-selector">
      <h3 className="scenario-title">Load Scenario</h3>
      <div className="scenario-buttons">
        {SCENARIOS.map(s => (
          <button
            key={s.name}
            className={`scenario-btn ${activeScenario === s.name ? 'active' : ''}`}
            onClick={() => loadScenario(s.name)}
            disabled={loading === s.name}
            title={s.desc}
          >
            <span className="scenario-emoji">{s.emoji}</span>
            <span className="scenario-label">{loading === s.name ? 'Loading...' : s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScenarioSelector;
