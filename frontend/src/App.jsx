import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';

// All 11 Pages
import DashboardPage from './pages/DashboardPage';
import ImageVerificationPage from './pages/ImageVerificationPage';
import VideoVerificationPage from './pages/VideoVerificationPage';
import PixelAnalysisPage from './pages/PixelAnalysisPage';
import MetadataAnalysisPage from './pages/MetadataAnalysisPage';
import C2PAPage from './pages/C2PAPage';
import RecycledMediaPage from './pages/RecycledMediaPage';
import SocialMonitoringPage from './pages/SocialMonitoringPage';
import AlertsPage from './pages/AlertsPage';
import VerificationReportsPage from './pages/VerificationReportsPage';
import SettingsPage from './pages/SettingsPage';

import { api } from './services/api';

const pageTitles = {
  'dashboard': 'System Overview & Threat Telemetry',
  'image-verify': 'AI-Generated Image Detection (PyTorch CNN)',
  'video-verify': 'Deepfake Video Forensics & Facial Jitter',
  'pixel-analysis': 'Pixel-Level Forensics & Frequency Transform',
  'metadata': 'Metadata Extraction & Camera Provenance',
  'c2pa': 'C2PA Content Credentials & Digital Signatures',
  'recycled': 'Perceptual Hashing & Recycled Media Index',
  'social-monitor': 'Authorized Social Media Stream Monitoring',
  'alerts': 'Security Alerts & Incident Triage Logs',
  'reports': 'Multimodal Evidence Fusion Reports',
  'settings': 'System Configurations & Member Allocations',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alertsCount, setAlertsCount] = useState(2); // Initial active alerts fallback

  // Fetch alerts count on startup
  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const res = await api.listAlerts();
        const unacknowledged = res.data.filter(a => !a.acknowledged);
        setAlertsCount(unacknowledged.length);
      } catch (err) {
        // Fallback gracefully to default
        console.warn('Backend alerts endpoint not reachable yet, using local default:', err);
      }
    };
    fetchAlertCount();
  }, []);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveTab} />;
      case 'image-verify':
        return <ImageVerificationPage />;
      case 'video-verify':
        return <VideoVerificationPage />;
      case 'pixel-analysis':
        return <PixelAnalysisPage />;
      case 'metadata':
        return <MetadataAnalysisPage />;
      case 'c2pa':
        return <C2PAPage />;
      case 'recycled':
        return <RecycledMediaPage />;
      case 'social-monitor':
        return <SocialMonitoringPage />;
      case 'alerts':
        return <AlertsPage onAlertsUpdated={() => setAlertsCount(prev => Math.max(0, prev - 1))} />;
      case 'reports':
        return <VerificationReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
        alertsCount={alertsCount} 
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Topbar 
          activeTitle={pageTitles[activeTab] || 'MediaTrust AI'} 
          onOpenAlerts={() => setActiveTab('alerts')} 
          alertsCount={alertsCount} 
        />
        
        <main 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '24px 32px',
            maxWidth: '1600px',
            width: '100%',
            margin: '0 auto'
          }}
        >
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}
