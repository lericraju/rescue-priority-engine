import React, { useState } from 'react';
import { Zap, Flame, Wind, RefreshCw, Play, Square, Settings2, Globe } from 'lucide-react';
import './GodModeToolbar.css';

const GodModeToolbar = ({ isSimulating, selectedSite, onSiteChange }) => {
  const [selectedScenario, setSelectedScenario] = useState('gas_leak');
  const [loading, setLoading] = useState(false);

  const handleStartStop = async () => {
    setLoading(true);
    const endpoint = isSimulating ? 'stop' : 'start';
    try {
      await fetch(`http://localhost:8000/api/simulation/${endpoint}`, { method: 'POST' });
    } catch (err) {
      console.error(`Failed to ${endpoint} simulation:`, err);
    }
    setLoading(false);
  };

  const handleApplyScenario = async () => {
    setLoading(true);
    try {
      await fetch(`http://localhost:8000/api/load_scenario?name=${selectedScenario}&site=${selectedSite}`, { 
        method: 'POST' 
      });
    } catch (err) {
      console.error('Failed to apply scenario:', err);
    }
    setLoading(false);
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await fetch(`http://localhost:8000/api/load_scenario?name=normal&site=${selectedSite}`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to reset:', err);
    }
    setLoading(false);
  };

  return (
    <div className="god-mode-toolbar">
      <div className="toolbar-header">
        <Settings2 size={20} className="text-gold" />
        <h2>SIMULATION CONTROL</h2>
        <div className={`status-pill ${isSimulating ? 'running' : 'paused'}`}>
          {isSimulating ? 'LIVE' : 'PAUSED'}
        </div>
      </div>

      <div className="control-group">
        <label><Globe size={14} /> Sector Target</label>
        <div className="site-selector">
          {['Site A', 'Site B'].map(site => (
            <button 
              key={site}
              className={`site-btn ${selectedSite === site ? 'active' : ''}`}
              onClick={() => onSiteChange(site)}
            >
              {site}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <label>Incident Scenario</label>
        <div className="scenario-grid">
          <button 
            className={`scenario-card ${selectedScenario === 'explosion' ? 'active' : ''}`}
            onClick={() => setSelectedScenario('explosion')}
          >
            <Flame size={18} />
            <span>Explosion</span>
          </button>
          <button 
            className={`scenario-card ${selectedScenario === 'gas_leak' ? 'active' : ''}`}
            onClick={() => setSelectedScenario('gas_leak')}
          >
            <Wind size={18} />
            <span>Gas Leak</span>
          </button>
          <button 
            className={`scenario-card ${selectedScenario === 'collapse' ? 'active' : ''}`}
            onClick={() => setSelectedScenario('collapse')}
          >
            <Zap size={18} />
            <span>Collapse</span>
          </button>
        </div>
      </div>

      <div className="main-actions">
        <button 
          className="apply-btn" 
          onClick={handleApplyScenario}
          disabled={loading}
        >
          Inject Incident
        </button>
        
        <div className="playback-controls">
          <button 
            className={`playback-btn ${isSimulating ? 'stop' : 'start'}`}
            onClick={handleStartStop}
            disabled={loading}
          >
            {isSimulating ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
          </button>
          
          <button className="reset-btn" onClick={handleReset} disabled={loading} title="Reset Scenario">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};


export default GodModeToolbar;
