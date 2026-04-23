import React, { useEffect, useState } from 'react';
import { X, BellOff } from 'lucide-react';
import './AlertPanel.css';

const levelIcon = { critical: '🚨', warning: '⚠️', info: 'ℹ️' };

const AlertPanel = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState([]);

  // Fetch all events whenever the panel opens
  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        const res = await fetch('https://rescue-priority-engine.onrender.com/api/events?limit=60');
        const data = await res.json();
        setEvents([...data].reverse()); // newest first
      } catch (e) {
        console.error('Failed to fetch events', e);
      }
    };
    load();
    const interval = setInterval(load, 4000); // refresh every 4s while open
    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="alert-backdrop" onClick={onClose} />}

      {/* Slide-out panel */}
      <div className={`alert-panel ${isOpen ? 'open' : ''}`}>
        <div className="alert-panel-header">
          <h3>Event Log</h3>
          <span className="alert-count">{events.length} events</span>
          <button className="alert-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="alert-panel-body">
          {events.length === 0 ? (
            <div className="alert-empty">
              <BellOff size={32} />
              <p>No events recorded yet</p>
            </div>
          ) : (
            events.map((evt, i) => (
              <div key={i} className={`alert-event-item ${evt.level}`}>
                <div className="alert-event-top">
                  <span className="alert-event-icon">{levelIcon[evt.level] || 'ℹ️'}</span>
                  <span className="alert-event-worker">{evt.worker_id}</span>
                  <span className="alert-event-time">T+{evt.timestamp}s</span>
                </div>
                <p className="alert-event-message">{evt.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default AlertPanel;
