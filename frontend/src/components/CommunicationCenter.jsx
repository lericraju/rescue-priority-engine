import React, { useState } from 'react';
import { AlertOctagon, HelpCircle, ShieldCheck } from 'lucide-react';
import './CommunicationCenter.css';

const CommunicationCenter = ({ selectedWorker, site }) => {
    const [lastMsg, setLastMsg] = useState(null);

    const sendCommand = async (command) => {
        if (!selectedWorker) return;
        try {
            await fetch(`http://localhost:8000/api/command/send?worker_id=${selectedWorker.id}&command=${command}&site=${site}`, {
                method: 'POST'
            });
            setLastMsg(`Command sent: ${command}`);
            setTimeout(() => setLastMsg(null), 3000);
        } catch (err) {
            console.error("Command failed:", err);
        }
    };

    return (
        <div className="comm-center">
            <h3 className="panel-title">Mission Communications</h3>
            <div className="worker-status-header">
                {selectedWorker ? (
                    <>
                        <span className="selected-id">{selectedWorker.id}</span>
                        <span className={`status-tag ${selectedWorker.survival_probability < 0.4 ? 'crit' : 'safe'}`}>
                            {selectedWorker.survival_probability < 0.4 ? 'CRITICAL' : 'REACHABLE'}
                        </span>
                    </>
                ) : (
                    <span className="no-selection">Select worker to issue orders</span>
                )}
            </div>

            <div className="action-grid">
                <button 
                    disabled={!selectedWorker}
                    className="action-btn evacuate"
                    onClick={() => sendCommand('EVACUATE')}
                >
                    <AlertOctagon size={16} /> EVACUATE
                </button>
                <button 
                    disabled={!selectedWorker}
                    className="action-btn stay"
                    onClick={() => sendCommand('STAY_PUT')}
                >
                    <ShieldCheck size={16} /> STAY PUT
                </button>
                <button 
                    disabled={!selectedWorker}
                    className="action-btn status"
                    onClick={() => sendCommand('STATUS_REPORT')}
                >
                    <HelpCircle size={16} /> REQ STATUS
                </button>
            </div>

            {lastMsg && <div className="comm-toast">{lastMsg}</div>}
        </div>
    );
};

export default CommunicationCenter;
