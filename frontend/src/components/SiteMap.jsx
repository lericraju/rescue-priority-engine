import React from 'react';
import { Map as MapIcon, User } from 'lucide-react';
import './SiteMap.css';

const SiteMap = ({ workers }) => {
  const sites = ['Site A', 'Site B'];

  return (
    <div className="site-map-container">
      <div className="map-header">
        <MapIcon size={16} />
        <h2>MINE SECTOR VISUALIZER</h2>
      </div>
      <div className="sites-display">
        {sites.map(site => (
          <div key={site} className="site-sector">
            <div className="sector-label">{site}</div>
            <div className="sector-grid">
              {workers
                .filter(w => w.site === site)
                .map(w => {
                  const isCritical = w.survival_probability < 0.4;
                  const isWarning = w.survival_probability < 0.7;
                  return (
                    <div 
                      key={w.id} 
                      className={`worker-dot ${isCritical ? 'critical' : isWarning ? 'warning' : 'safe'}`}
                      title={`${w.id}: ${Math.round(w.survival_probability * 100)}% survival`}
                    >
                      <User size={12} />
                      <span className="dot-id">{w.id.split('_').pop()}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SiteMap;
