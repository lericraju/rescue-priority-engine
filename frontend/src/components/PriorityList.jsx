import React from 'react';
import { AlertCircle, ArrowUpRight } from 'lucide-react';
import './PriorityList.css';

const PriorityList = ({ workers, onSelectWorker, onRescue }) => {
  // Ensure workers are sorted by priority
  const sortedWorkers = [...workers].sort((a, b) => a.priority - b.priority);

  return (
    <div className="priority-list-container">
      <div className="priority-list-header">
        <AlertCircle size={20} className="pulse-icon text-red" />
        <h2>Rescue Priority</h2>
      </div>
      
      <div className="priority-items">
        {sortedWorkers.map((worker, index) => {
          const isTopPriority = index === 0;
          return (
            <div 
              key={worker.id} 
              className={`priority-item ${isTopPriority ? 'top-priority' : ''} ${worker.is_live ? 'live-item' : ''}`}
              onClick={() => onSelectWorker && onSelectWorker(worker)}
              style={{ cursor: onSelectWorker ? 'pointer' : 'default' }}
            >
              <div className="priority-rank">
                #{worker.priority}
              </div>
              <div className="priority-details">
                <div className="priority-name">{worker.id} {worker.is_live && <span className="live-dot-small"></span>}</div>
                <div className="priority-prob">
                  Survival: {Math.round(worker.survival_probability * 100)}%
                </div>
              </div>
              {isTopPriority && (
                <button 
                  className="rescue-now-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRescue && onRescue(worker);
                  }}
                >
                  RESCUE NOW <ArrowUpRight size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PriorityList;
