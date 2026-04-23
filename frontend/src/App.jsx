import React, { useEffect, useState } from "react";
import WorkerCard from "./components/WorkerCard";
import PriorityList from "./components/PriorityList";
import GodModeToolbar from "./components/GodModeToolbar";
import MissionLog from "./components/MissionLog";
import MineMap from "./components/MineMap";
import SurvivalForecast from "./components/SurvivalForecast";
import CommunicationCenter from "./components/CommunicationCenter";
import { Shield } from "lucide-react";
import "./App.css";

function App() {
  const [workers, setWorkers] = useState([]);
  const [gasHeatmap, setGasHeatmap] = useState([]);
  const [rescueTeams, setRescueTeams] = useState([]);
  const [grid, setGrid] = useState([]);
  const [collapsedCells, setCollapsedCells] = useState([]);
  const [entryPoints, setEntryPoints] = useState([]);
  const [exitPoints, setExitPoints] = useState([]);
  const [gasOrigins, setGasOrigins] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [role, setRole] = useState("Commander"); // "Commander" | "Responder"
  const [selectedSite, setSelectedSite] = useState("Site A");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/live_status?site=${selectedSite}`);
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setWorkers(data.workers);
        setGasHeatmap(data.gas_heatmap);
        setRescueTeams(data.rescue_teams);
        setGrid(data.grid);
        setCollapsedCells(data.collapsed_cells || []);
        setEntryPoints(data.entry_points || []);
        setExitPoints(data.exit_points || []);
        setGasOrigins(data.gas_origins || []);
        setIsSimulating(data.is_simulating);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch live status:", err);
        setError("Connection to backend lost. Retrying...");
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [selectedSite]);

  const selectedWorker = workers.find(w => w.id === selectedWorkerId);

  const handleDispatch = async (teamId, targetWorkerId) => {
    try {
      await fetch(`https://rescue-priority-engine.onrender.com/api/dispatch?site=${selectedSite}&team_id=${teamId}&target_worker_id=${targetWorkerId}`, {
        method: 'POST'
      });
    } catch (err) {
      console.error("Dispatch failed:", err);
    }
  };

  const handleRescueNow = (worker) => {
    if (!rescueTeams || rescueTeams.length === 0) return;
    
    // Find nearest team to worker
    let nearestTeam = null;
    let minDistance = Infinity;
    
    rescueTeams.forEach(team => {
      if (team.status === "Ready" || team.status === "On Site") {
        const dist = Math.abs(team.location.row - worker.location.row) + 
                     Math.abs(team.location.col - worker.location.col);
        if (dist < minDistance) {
          minDistance = dist;
          nearestTeam = team;
        }
      }
    });

    const teamToDispatch = nearestTeam || rescueTeams[0];
    handleDispatch(teamToDispatch.id, worker.id);
  };

  return (
    <div className={`app-container role-${role.toLowerCase()}`}>
      <header className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>LASTBREATH Command Center</h1>
          <div className="role-badge">
            <Shield size={14} /> {role} Mode — {selectedSite}
          </div>
        </div>
        
        <div className="header-actions">
          <div className="role-switcher">
            <button className={role === "Commander" ? "active" : ""} onClick={() => setRole("Commander")}>COMMANDER</button>
            <button className={role === "Responder" ? "active" : ""} onClick={() => setRole("Responder")}>RESPONDER</button>
          </div>
          <div className="live-indicator">
            <span className={`live-dot ${isSimulating ? 'active' : 'paused'}`}></span>
            {isSimulating ? 'Simulation Live' : 'System Standby'}
          </div>
        </div>
      </header>

      {error ? (
        <div className="connection-error">{error}</div>
      ) : (
        <main className="dashboard-content">
          <div className="main-panel">
            {role === "Commander" ? (
              <>
                <div className="upper-dash">
                  <MineMap 
                    workers={workers} 
                    gasHeatmap={gasHeatmap} 
                    rescueTeams={rescueTeams}
                    grid={grid}
                    collapsedCells={collapsedCells}
                    entryPoints={entryPoints}
                    exitPoints={exitPoints}
                    gasOrigins={gasOrigins}
                    onSelectWorker={(w) => setSelectedWorkerId(w.id)}
                    onDispatch={handleDispatch}
                    siteName={selectedSite}
                  />
                  <div className="side-panels">
                    <CommunicationCenter selectedWorker={selectedWorker} site={selectedSite} />
                    <MissionLog site={selectedSite} />
                  </div>
                </div>
                <div className="lower-dash">
                  <SurvivalForecast workerId={selectedWorkerId} site={selectedSite} />
                </div>
              </>
            ) : (
              <div className="responder-view">
                <div className="focus-card">
                  {selectedWorker ? (
                    <WorkerCard worker={selectedWorker} priority={selectedWorker.priority} />
                  ) : (
                    <div className="no-selection-msg">Select worker from priority list to track</div>
                  )}
                </div>
                <div className="responder-map">
                   <MineMap 
                    workers={workers} 
                    gasHeatmap={gasHeatmap} 
                    rescueTeams={rescueTeams}
                    grid={grid}
                    collapsedCells={collapsedCells}
                    entryPoints={entryPoints}
                    exitPoints={exitPoints}
                    gasOrigins={gasOrigins}
                    onSelectWorker={(w) => setSelectedWorkerId(w.id)}
                    onDispatch={handleDispatch}
                    siteName={selectedSite}
                  />
                </div>
              </div>
            )}
          </div>

          <aside className="sidebar">
            <GodModeToolbar 
              isSimulating={isSimulating} 
              selectedSite={selectedSite}
              onSiteChange={(site) => {
                setSelectedSite(site);
                setSelectedWorkerId(null);
              }}
            />
            <PriorityList 
              workers={workers} 
              onSelectWorker={(w) => setSelectedWorkerId(w.id)} 
              onRescue={handleRescueNow}
            />
          </aside>
        </main>
      )}
    </div>
  );
}


export default App;
