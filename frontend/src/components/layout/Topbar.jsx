import React from 'react';
import { Activity, Bell, Database, Server } from 'lucide-react';

export const Topbar = ({ activeTitle, onOpenAlerts, alertsCount = 0 }) => {
  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>{activeTitle}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Backend Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            fontSize: '0.75rem',
            color: 'var(--accent-green)',
            fontWeight: 600,
          }}
        >
          <Server size={14} />
          <span>FastAPI 8000 OK</span>
        </div>

        {/* Database Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            fontSize: '0.75rem',
            color: 'var(--accent-cyan)',
            fontWeight: 600,
          }}
        >
          <Database size={14} />
          <span>MySQL 8.0</span>
        </div>

        {/* Alerts Button */}
        <button
          onClick={onOpenAlerts}
          style={{
            position: 'relative',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: alertsCount > 0 ? 'var(--accent-amber)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bell size={18} />
          {alertsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--accent-red)',
                color: '#FFFFFF',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {alertsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Topbar;

