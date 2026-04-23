import React, { useEffect, useState } from 'react';
import './MissionClock.css';

const MissionClock = ({ elapsedSeconds }) => {
  const h = Math.floor(elapsedSeconds / 3600);
  const m = Math.floor((elapsedSeconds % 3600) / 60);
  const s = Math.floor(elapsedSeconds % 60);

  const pad = (n) => String(n).padStart(2, '0');

  const urgency = elapsedSeconds > 3600 ? 'critical' : elapsedSeconds > 1800 ? 'warning' : 'normal';

  return (
    <div className={`mission-clock ${urgency}`}>
      <span className="clock-label">T+</span>
      <span className="clock-digits">{pad(h)}:{pad(m)}:{pad(s)}</span>
    </div>
  );
};

export default MissionClock;
