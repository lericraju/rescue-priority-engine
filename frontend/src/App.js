import React, { useEffect, useState, useRef, useCallback } from "react";
import WorkerCard from "./components/WorkerCard";
import PriorityList from "./components/PriorityList";
import MissionClock from "./components/MissionClock";
import WorkerModal from "./components/WorkerModal";
import ToastNotification from "./components/ToastNotification";
import MineMap from "./components/MineMap";
import ScenarioSelector from "./components/ScenarioSelector";
import AlertPanel from "./components/AlertPanel";
import { Activity, Bell } from "lucide-react";
import "./App.css";

const MAX_HISTORY = 40;

function App() {
  const [workers, setWorkers] = useState([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerHistories, setWorkerHistories] = useState({});
  const [toasts, setToasts] = useState([]);
  const [alertPanelOpen, setAlertPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const prevRanksRef = useRef({});
  const wsRef = useRef(null);
  const toastIdRef = useRef(0);

  // Tracks event keys already shown as toasts: "workerId|timestamp|message"
  const seenEventsRef = useRef(new Set());
  // Tracks rank-change pairs already toasted: "workerId|oldRank|newRank"
  const seenRankChangesRef = useRef(new Set());

  // -----------------------------------------------------------------------
  //  Toast helpers
  // -----------------------------------------------------------------------
  const addToast = useCallback((title, message, level = "warning") => {
    const id = toastIdRef.current++;
    setToasts(prev => [...prev.slice(-3), { id, title, message, level }]); // max 4 at once
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // -----------------------------------------------------------------------
  //  Rank-change detection — show each rank change only once
  // -----------------------------------------------------------------------
  const checkRankChanges = useCallback((newWorkers) => {
    const prev = prevRanksRef.current;
    newWorkers.forEach(w => {
      const oldRank = prev[w.id];
      if (oldRank !== undefined && oldRank !== w.priority) {
        const changeKey = `${w.id}|${oldRank}|${w.priority}`;
        if (!seenRankChangesRef.current.has(changeKey)) {
          seenRankChangesRef.current.add(changeKey);
          if (w.priority === 1) {
            addToast(
              `🚨 RESCUE NOW: ${w.id}`,
              `Priority jumped to #1 — survival ${Math.round(w.survival_probability * 100)}%`,
              "critical"
            );
          } else if (w.priority < oldRank) {
            addToast(
              `⚠️ Priority Upgrade: ${w.id}`,
              `Moved from #${oldRank} → #${w.priority}`,
              "warning"
            );
          }
        }
      }
    });
    const newRanks = {};
    newWorkers.forEach(w => { newRanks[w.id] = w.priority; });
    prevRanksRef.current = newRanks;
  }, [addToast]);

  // -----------------------------------------------------------------------
  //  History recording
  // -----------------------------------------------------------------------
  const recordHistory = useCallback((newWorkers, elapsed) => {
    setWorkerHistories(prev => {
      const next = { ...prev };
      newWorkers.forEach(w => {
        const hist = next[w.id] || [];
        const point = {
          t: Math.round(elapsed),
          heart_rate: parseFloat(w.heart_rate?.toFixed(1)),
          oxygen_percent: parseFloat(w.oxygen_percent?.toFixed(2)),
          gas_ppm: parseFloat(w.gas_ppm?.toFixed(0)),
          survival_probability: parseFloat(w.survival_probability?.toFixed(3)),
        };
        next[w.id] = [...hist.slice(-(MAX_HISTORY - 1)), point];
      });
      return next;
    });
  }, []);

  // -----------------------------------------------------------------------
  //  Event deduplication — each backend event shown as toast exactly once
  // -----------------------------------------------------------------------
  const processEvents = useCallback((events) => {
    if (!events || events.length === 0) return;
    events.forEach(evt => {
      // Unique key = worker + timestamp + message (timestamp is unique per event)
      const key = `${evt.worker_id}|${evt.timestamp}|${evt.message}`;
      if (!seenEventsRef.current.has(key)) {
        seenEventsRef.current.add(key);
        if (evt.level === "critical") {
          addToast(`🚨 ${evt.worker_id}`, evt.message, "critical");
          setUnreadCount(c => c + 1);
        }
        // Only critical events pop up; warnings go straight to the panel (no spam)
      }
    });
  }, [addToast]);

  // -----------------------------------------------------------------------
  //  WebSocket connection
  // -----------------------------------------------------------------------
  useEffect(() => {
    let reconnectTimeout;

    const connect = () => {
      const ws = new WebSocket("ws://localhost:8000/ws/live_status");
      wsRef.current = ws;

      ws.onopen = () => setConnectionStatus("online");

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { workers: w, elapsed_seconds, events } = payload;
          setWorkers(w);
          setElapsedSeconds(elapsed_seconds || 0);
          checkRankChanges(w);
          recordHistory(w, elapsed_seconds || 0);
          processEvents(events);
        } catch (err) {
          console.error("WS parse error:", err);
        }
      };

      ws.onclose = () => {
        setConnectionStatus("reconnecting");
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        setConnectionStatus("error");
        ws.close();
      };
    };

    connect();
    return () => {
      clearTimeout(reconnectTimeout);
      wsRef.current?.close();
    };
  }, [checkRankChanges, recordHistory, processEvents]);

  // -----------------------------------------------------------------------
  //  Scenario reset handler
  // -----------------------------------------------------------------------
  const handleScenarioLoad = (name) => {
    setElapsedSeconds(0);
    prevRanksRef.current = {};
    seenEventsRef.current.clear();
    seenRankChangesRef.current.clear();
    setWorkerHistories({});
    setUnreadCount(0);
    addToast(`Scenario Loaded`, `"${name}" simulation started`, "info");
  };

  const handleOpenAlertPanel = () => {
    setAlertPanelOpen(true);
    setUnreadCount(0);
  };

  // -----------------------------------------------------------------------
  //  Render
  // -----------------------------------------------------------------------
  const statusColor = {
    online:       "var(--accent-green)",
    connecting:   "var(--accent-orange)",
    reconnecting: "var(--accent-orange)",
    error:        "var(--accent-red)",
  };

  return (
    <div className="app-container">
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />

      {selectedWorker && (
        <WorkerModal
          worker={selectedWorker}
          history={workerHistories[selectedWorker.id]}
          onClose={() => setSelectedWorker(null)}
        />
      )}

      <AlertPanel isOpen={alertPanelOpen} onClose={() => setAlertPanelOpen(false)} />

      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>LASTBREATH Command Center</h1>
          <p><Activity size={16} /> Rescue Priority Engine v2.0</p>
        </div>
        <div className="header-right">
          <MissionClock elapsedSeconds={elapsedSeconds} />

          {/* Alert bell */}
          <button className="alert-bell-btn" onClick={handleOpenAlertPanel} title="Open event log">
            <Bell size={18} />
            {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
          </button>

          <div
            className="live-indicator"
            style={{
              borderColor: `${statusColor[connectionStatus]}33`,
              color: statusColor[connectionStatus],
              background: `${statusColor[connectionStatus]}15`,
            }}
          >
            <span className="live-dot" style={{ backgroundColor: statusColor[connectionStatus] }}></span>
            {connectionStatus === "online" ? "System Online" : connectionStatus === "reconnecting" ? "Reconnecting..." : "Connecting"}
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="dashboard-content">
        <div className="main-panel">
          <h2 className="section-title">Active Personnel Status</h2>
          <div className="workers-grid">
            {workers.map((w) => (
              <WorkerCard key={w.id} worker={w} onClick={() => setSelectedWorker(w)} />
            ))}
          </div>
        </div>

        <aside className="sidebar">
          <div className="priority-list">
            <PriorityList workers={workers} />
          </div>
          <MineMap workers={workers} onSelectWorker={setSelectedWorker} />
          <ScenarioSelector onScenarioLoad={handleScenarioLoad} />
        </aside>
      </main>
    </div>
  );
}

export default App;
