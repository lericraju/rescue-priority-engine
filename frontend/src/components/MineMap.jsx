import React, { useMemo, useState } from 'react';
import './MineMap.css';

const CELL_W = 54;
const CELL_H = 54;
const PAD = 36;

const toSVG = (row, col) => ({
  x: PAD + col * CELL_W + CELL_W / 2,
  y: PAD + row * CELL_H + CELL_H / 2,
});

const getGasOpacity = (ppm) => {
  if (ppm < 50) return 0;
  return Math.min(0.65, ppm / 1100);
};

const getSurvivalColor = (prob) => {
  if (prob < 0.4) return '#ef4444';
  if (prob < 0.7) return '#f59e0b';
  return '#3b82f6';
};

const WorkerPin = ({ x, y, worker, isSelected, onClick }) => {
  const color = getSurvivalColor(worker.survival_probability ?? 0.9);
  const isCritical = (worker.survival_probability ?? 0.9) < 0.4;
  const label = worker.id.replace('Worker_', '').replace('LIVE_', 'S-').split('_').pop();

  return (
    <g
      className={`worker-pin-group ${isCritical ? 'is-critical' : ''} ${isSelected ? 'is-selected' : ''}`}
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Outer pulse ring */}
      <circle r="20" fill="none" stroke={color} strokeWidth="1" opacity="0.2" className="pulse-ring-outer" />
      {/* Inner pulse ring */}
      <circle r="13" fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" className="pulse-ring-inner" />
      {/* Pin glow halo */}
      <circle r="9" fill={color} opacity="0.15" />
      {/* Pin core */}
      <circle r="6" fill={color} opacity="0.25" stroke={color} strokeWidth="1.5" />
      <circle r="3.5" fill={color} />
      {/* Label tag */}
      <rect x="-18" y="-30" width="36" height="14" rx="3" fill="rgba(0,0,0,0.7)" stroke={color} strokeWidth="0.8" opacity="0.9" />
      <text
        x="0" y="-20"
        textAnchor="middle"
        fill={color}
        fontSize="8.5"
        fontWeight="700"
        fontFamily="'JetBrains Mono', 'Courier New', monospace"
        letterSpacing="0.5"
      >
        {label}
      </text>
    </g>
  );
};

const TeamPin = ({ x, y, team, isDispatching, onClick }) => {
  const color = isDispatching ? '#f59e0b' : '#10b981';
  return (
    <g
      className={`team-pin-group ${isDispatching ? 'dispatching' : ''}`}
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <circle r="16" fill="none" stroke={color} strokeWidth="1" opacity="0.3" className="team-pulse-ring" />
      {/* Triangle marker */}
      <polygon points="0,-10 9,5 -9,5" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1.5" />
      <circle r="3" fill={color} cy="-2" />
      <text
        x="0" y="18"
        textAnchor="middle"
        fill={color}
        fontSize="7.5"
        fontWeight="800"
        fontFamily="'JetBrains Mono', 'Courier New', monospace"
        letterSpacing="0.5"
      >
        RESQ
      </text>
    </g>
  );
};

const MineMap = ({ workers = [], gasHeatmap = [], rescueTeams = [], grid = [], collapsedCells = [], entryPoints = [], exitPoints = [], gasOrigins = [], onSelectWorker, onDispatch, siteName }) => {
  const [dispatchingTeamId, setDispatchingTeamId] = useState(null);
  const [localSelectedId, setLocalSelectedId] = useState(null);

  const rows = grid?.length || 0;
  const cols = grid?.[0]?.length || 0;

  const edges = useMemo(() => {
    if (rows === 0 || cols === 0) return [];
    const result = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 1) {
          if (c + 1 < cols && grid[r][c + 1] === 1) {
            const a = toSVG(r, c);
            const b = toSVG(r, c + 1);
            result.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
          }
          if (r + 1 < rows && grid[r + 1][c] === 1) {
            const a = toSVG(r, c);
            const b = toSVG(r + 1, c);
            result.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
          }
        }
      }
    }
    return result;
  }, [grid, rows, cols]);

  const tunnelNodes = useMemo(() => {
    if (rows === 0 || cols === 0) return [];
    const result = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 1) result.push({ r, c, ...toSVG(r, c) });
      }
    }
    return result;
  }, [grid, rows, cols]);

  if (!grid || grid.length === 0) {
    return (
      <div className="neon-map-container">
        <div className="neon-map-loading">
          <div className="neon-loading-bar" />
          <span>INITIALIZING TACTICAL GRID...</span>
        </div>
      </div>
    );
  }

  const svgW = PAD * 2 + cols * CELL_W;
  const svgH = PAD * 2 + rows * CELL_H;

  const handleWorkerClick = (worker) => {
    setLocalSelectedId(worker.id);
    onSelectWorker && onSelectWorker(worker);
    if (dispatchingTeamId) {
      onDispatch && onDispatch(dispatchingTeamId, worker.id);
      setDispatchingTeamId(null);
    }
  };

  const handleTeamClick = (team) => {
    setDispatchingTeamId(prev => prev === team.id ? null : team.id);
  };

  const hasGas = gasHeatmap?.flat().some(v => v > 50);

  return (
    <div className="neon-map-container">
      {/* Header bar */}
      <div className="neon-map-header">
        <div className="neon-header-badge">
          <span className="neon-badge-dot blue" />
          SECTOR: {siteName}
        </div>
        <div className="neon-header-badge">
          <span className={`neon-badge-dot ${dispatchingTeamId ? 'amber' : 'green'}`} />
          {dispatchingTeamId ? 'SELECT TARGET WORKER' : 'ACTIVE MONITORING'}
        </div>
        <div className="neon-header-badge">
          <span className="neon-badge-dot blue" />
          {workers.length} PERSONNEL
        </div>
      </div>

      {/* 3D perspective map viewport */}
      <div className="neon-map-viewport">
        <div className="neon-perspective-stage">
          <svg
            width={svgW}
            height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="neon-svg"
            style={{ overflow: 'visible' }}
          >
            <defs>
              {/* Multi-layer neon glow for tunnel lines */}
              <filter id={`tunnel-glow-${siteName?.replace(' ', '')}`} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur-wide" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur-tight" />
                <feMerge>
                  <feMergeNode in="blur-wide" />
                  <feMergeNode in="blur-tight" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Pin glow */}
              <filter id={`pin-glow-${siteName?.replace(' ', '')}`} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ── Layer 1: Background node grid dots ── */}
            {tunnelNodes.map(({ r, c, x, y }) => (
              <circle key={`bg-${r}-${c}`} cx={x} cy={y} r="2.5" fill="#0d2a4a" opacity="0.8" />
            ))}

            {/* ── Layer 2: Gas heatmap circles ── */}
            {tunnelNodes.map(({ r, c, x, y }) => {
              const gas = gasHeatmap?.[r]?.[c] || 0;
              const op = getGasOpacity(gas);
              if (op < 0.04) return null;
              return (
                <circle
                  key={`gas-${r}-${c}`}
                  cx={x} cy={y}
                  r={CELL_W * 0.9}
                  fill={`rgba(255, 80, 0, ${op})`}
                  className="gas-blob"
                />
              );
            })}

            {/* ── Layer 2.5: Entry and Exit Points ── */}
            {entryPoints?.map(({ row, col }, i) => {
              const { x, y } = toSVG(row, col);
              return (
                <g key={`entry-${i}`} transform={`translate(${x}, ${y})`}>
                  <rect x="-16" y="-16" width="32" height="32" rx="4" fill="none" stroke="#4ade80" strokeWidth="2" strokeDasharray="4 2" className="entry-pulse" />
                  <text x="0" y="-22" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="bold">ENTRY</text>
                </g>
              );
            })}
            {exitPoints?.map(({ row, col }, i) => {
              const { x, y } = toSVG(row, col);
              return (
                <g key={`exit-${i}`} transform={`translate(${x}, ${y})`}>
                  <rect x="-16" y="-16" width="32" height="32" rx="4" fill="none" stroke="#2dd4bf" strokeWidth="2" strokeDasharray="4 2" className="exit-pulse" />
                  <text x="0" y="-22" textAnchor="middle" fill="#2dd4bf" fontSize="10" fontWeight="bold">EXIT</text>
                </g>
              );
            })}

            {/* ── Layer 2.8: Disaster Origin Radius ── */}
            {gasOrigins?.map(([r, c], i) => {
              const { x, y } = toSVG(r, c);
              return (
                <g key={`disaster-${i}`} transform={`translate(${x}, ${y})`}>
                  <circle r="120" fill="rgba(239, 68, 68, 0.05)" stroke="#ef4444" strokeWidth="2" strokeDasharray="10 5" opacity="0.6" className="disaster-radius-pulse" />
                  <text x="0" y="-130" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="bold" letterSpacing="2">AFFECTED ZONE</text>
                </g>
              );
            })}

            {/* ── Layer 3: Tunnel line base (dark thick) ── */}
            {edges.map((e, i) => (
              <line
                key={`base-${i}`}
                x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                stroke="#071d38"
                strokeWidth="10"
                strokeLinecap="round"
              />
            ))}

            {/* ── Layer 4: Tunnel lines with neon glow ── */}
            <g filter={`url(#tunnel-glow-${siteName?.replace(' ', '')})`}>
              {edges.map((e, i) => (
                <line
                  key={`glow-${i}`}
                  x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                  stroke="#1565c0"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  opacity="0.9"
                />
              ))}
            </g>

            {/* ── Layer 5: Bright centre line ── */}
            {edges.map((e, i) => (
              <line
                key={`bright-${i}`}
                x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                stroke="#90caf9"
                strokeWidth="0.6"
                strokeLinecap="round"
                opacity="0.5"
              />
            ))}

            {/* ── Layer 6: Junction node dots (glowing) ── */}
            <g filter={`url(#tunnel-glow-${siteName?.replace(' ', '')})`}>
              {tunnelNodes.map(({ r, c, x, y }) => (
                <circle key={`node-${r}-${c}`} cx={x} cy={y} r="3.5" fill="#2196f3" />
              ))}
            </g>

            {/* ── Layer 6.5: Collapsed cells (Red X) ── */}
            {collapsedCells?.map(([r, c], i) => {
              const { x, y } = toSVG(r, c);
              return (
                <g key={`collapsed-${r}-${c}`} transform={`translate(${x}, ${y})`}>
                  <circle r="14" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
                  <line x1="-8" y1="-8" x2="8" y2="8" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="8" y1="-8" x2="-8" y2="8" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              );
            })}

            {/* ── Layer 7: Rescue team pins ── */}
            <g filter={`url(#pin-glow-${siteName?.replace(' ', '')})`}>
              {rescueTeams?.map(team => {
                const pos = toSVG(team.location.row, team.location.col);
                return (
                  <TeamPin
                    key={team.id}
                    x={pos.x} y={pos.y}
                    team={team}
                    isDispatching={dispatchingTeamId === team.id}
                    onClick={() => handleTeamClick(team)}
                  />
                );
              })}
            </g>

            {/* ── Layer 8: Worker pins ── */}
            <g filter={`url(#pin-glow-${siteName?.replace(' ', '')})`}>
              {workers?.map(worker => {
                const pos = toSVG(worker.location.row, worker.location.col);
                return (
                  <WorkerPin
                    key={worker.id}
                    x={pos.x} y={pos.y}
                    worker={worker}
                    isSelected={localSelectedId === worker.id}
                    onClick={() => handleWorkerClick(worker)}
                  />
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="neon-map-legend">
        <div className="legend-chip safe"><span className="legend-dot-sm" />Safe</div>
        <div className="legend-chip warning"><span className="legend-dot-sm" />At Risk</div>
        <div className="legend-chip critical"><span className="legend-dot-sm" />Critical</div>
        <div className="legend-chip team"><span className="legend-dot-sm" />Rescue Team</div>
        {hasGas && <div className="legend-chip gas"><span className="legend-dot-sm" />Toxic Gas</div>}
      </div>

      {/* Dispatch banner */}
      {dispatchingTeamId && (
        <div className="neon-dispatch-banner">
          <span className="dispatch-icon">⚠</span>
          <span>SELECT WORKER TO DISPATCH <strong>{dispatchingTeamId}</strong></span>
          <button className="dispatch-cancel" onClick={() => setDispatchingTeamId(null)}>CANCEL</button>
        </div>
      )}
    </div>
  );
};

export default MineMap;
