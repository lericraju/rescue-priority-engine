import React, { useEffect, useRef, useState } from 'react';
import { Terminal, AlertCircle, Info, Flame } from 'lucide-react';
import './MissionLog.css';

const MissionLog = ({ site }) => {
  const [logs, setLogs] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`https://rescue-priority-engine.onrender.com/api/events?site=${site}`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [site]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getIcon = (level) => {
    switch (level) {
      case 'critical': return <Flame size={14} className="text-red" />;
      case 'warning': return <AlertCircle size={14} className="text-orange" />;
      default: return <Info size={14} className="text-blue" />;
    }
  };

  return (
    <div className="mission-log-container">
      <div className="log-header">
        <Terminal size={16} />
        <h2>MISSION COMMAND LOG</h2>
      </div>
      <div className="log-entries" ref={scrollRef}>
        {logs.length === 0 && <div className="no-logs">Waiting for system events...</div>}
        {logs.map((log, idx) => (
          <div key={idx} className={`log-entry ${log.level}`}>
            <span className="log-time">T+{Math.round(log.timestamp)}s</span>
            {getIcon(log.level)}
            <span className="log-worker">[{log.worker_id}]</span>
            <span className="log-msg">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissionLog;
