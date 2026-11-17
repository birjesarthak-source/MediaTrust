import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const UncertaintyNotice = ({ text, type = 'info' }) => {
  const isAlert = type === 'warning' || type === 'alert';
  const accent = isAlert ? 'var(--accent-amber)' : 'var(--accent-cyan)';
  const bg = isAlert ? 'rgba(245, 158, 11, 0.08)' : 'rgba(0, 240, 255, 0.08)';
  const border = isAlert ? 'rgba(245, 158, 11, 0.3)' : 'rgba(0, 240, 255, 0.3)';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: '8px',
        marginTop: '16px',
      }}
    >
      <div style={{ color: accent, marginTop: '2px' }}>
        {isAlert ? <ShieldAlert size={18} /> : <Info size={18} />}
      </div>
      <div>
        <h5 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Forensic Epistemic Notice
        </h5>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {text || 'Missing metadata or C2PA credentials are not treated as evidence of falsification. Social media compression can attenuate high-frequency features and requires human verification.'}
        </p>
      </div>
    </div>
  );
};

export default UncertaintyNotice;

