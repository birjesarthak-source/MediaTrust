import React from 'react';

export const StatusBadge = ({ status, size = 'md' }) => {
  if (!status) return null;

  let bg = '#1E293B';
  let border = '#334155';
  let text = '#94A3B8';

  const s = status.toLowerCase();

  if (s.includes('likely authentic') || s.includes('valid') || s.includes('healthy') || s.includes('connected')) {
    bg = 'rgba(16, 185, 129, 0.15)';
    border = 'rgba(16, 185, 129, 0.4)';
    text = '#10B981';
  } else if (s.includes('ai-generated') || s.includes('high') || s.includes('critical')) {
    bg = 'rgba(239, 68, 68, 0.15)';
    border = 'rgba(239, 68, 68, 0.4)';
    text = '#EF4444';
  } else if (s.includes('manipulated') || s.includes('invalid') || s.includes('medium')) {
    bg = 'rgba(245, 158, 11, 0.15)';
    border = 'rgba(245, 158, 11, 0.4)';
    text = '#F59E0B';
  } else if (s.includes('previously circulated') || s.includes('similar')) {
    bg = 'rgba(58, 134, 255, 0.15)';
    border = 'rgba(58, 134, 255, 0.4)';
    text = '#3A86FF';
  } else if (s.includes('further verification') || s.includes('low') || s.includes('configured')) {
    bg = 'rgba(0, 240, 255, 0.15)';
    border = 'rgba(0, 240, 255, 0.4)';
    text = '#00F0FF';
  }

  const padding = size === 'sm' ? '2px 8px' : '4px 12px';
  const fontSize = size === 'sm' ? '0.72rem' : '0.82rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding,
        fontSize,
        fontWeight: 600,
        borderRadius: '6px',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: text,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: text,
        }}
      />
      {status}
    </span>
  );
};

export default StatusBadge;

