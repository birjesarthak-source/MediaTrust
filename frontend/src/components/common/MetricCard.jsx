import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon: Icon, accent = '#00F0FF', trend }) => {
  return (
    <div
      className="glass-card"
      style={{
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${accent}, transparent)`,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px' }}>
            {title}
          </p>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            {value}
          </h3>
          {subtitle && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div
            style={{
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: accent,
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>
      {trend && (
        <div style={{ marginTop: '12px', fontSize: '0.78rem', color: accent, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;

