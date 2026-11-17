import React from 'react';
import {
  LayoutDashboard,
  Image,
  Video,
  Cpu,
  FileText,
  ShieldCheck,
  Repeat,
  Radio,
  AlertTriangle,
  FileCheck2,
  Settings,
  Shield,
} from 'lucide-react';

export const Sidebar = ({ activeTab, onSelectTab, alertsCount = 0 }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
    { id: 'image-verify', label: 'Image Verification', icon: Image },
    { id: 'video-verify', label: 'Video Verification', icon: Video },
    { id: 'pixel-analysis', label: 'Pixel Analysis', icon: Cpu },
    { id: 'metadata', label: 'Metadata Analysis', icon: FileText },
    { id: 'c2pa', label: 'C2PA Verification', icon: ShieldCheck },
    { id: 'recycled', label: 'Recycled Media', icon: Repeat },
    { id: 'social-monitor', label: 'Social Monitoring', icon: Radio },
    { id: 'alerts', label: 'Alerts & Logs', icon: AlertTriangle, badge: alertsCount },
    { id: 'reports', label: 'Verification Reports', icon: FileCheck2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            color: 'var(--accent-cyan)',
          }}
        >
          <Shield size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            MediaTrust<span style={{ color: 'var(--accent-cyan)' }}>.AI</span>
          </h2>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Forensics & Authenticity
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, padding: '0 12px 10px', letterSpacing: '0.08em' }}>
          Verification Suite
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: isActive ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid transparent',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.15s ease',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--accent-red)',
                      color: '#FFFFFF',
                      padding: '2px 7px',
                      borderRadius: '10px',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer Info */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(7, 11, 25, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-green)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>System Active (v1.0.0)</span>
        </div>
        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          College Major Project • 3 Members
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;

