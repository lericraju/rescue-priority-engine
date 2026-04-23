import React, { useEffect } from 'react';
import './ToastNotification.css';

const ToastNotification = ({ toasts, onDismiss }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`toast-item ${toast.level}`}
          onClick={() => onDismiss(toast.id)}
        >
          <div className="toast-icon">
            {toast.level === 'critical' ? '🚨' : toast.level === 'warning' ? '⚠️' : 'ℹ️'}
          </div>
          <div className="toast-body">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
          <button className="toast-close" onClick={() => onDismiss(toast.id)}>✕</button>
        </div>
      ))}
    </div>
  );
};

export default ToastNotification;
