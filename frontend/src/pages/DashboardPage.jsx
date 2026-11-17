import React, { useEffect, useState } from 'react';
import {
  FileCheck2,
  Image as ImageIcon,
  Video as VideoIcon,
  AlertTriangle,
  Radio,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { api } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { UncertaintyNotice } from '../components/common/UncertaintyNotice';

export const DashboardPage = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalMedia: 18,
    totalImages: 12,
    totalVideos: 6,
    suspiciousMedia: 5,
  });
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [repRes, altRes, medRes] = await Promise.all([
          api.listReports().catch(() => ({ data: [] })),
          api.listAlerts().catch(() => ({ data: [] })),
          api.listMedia().catch(() => ({ data: [] })),
        ]);

        const repList = repRes.data || [];
        const altList = altRes.data || [];
        const medList = medRes.data || [];

        setReports(repList);
        setAlerts(altList);

        if (medList.length > 0) {
          const imgs = medList.filter((m) => m.media_type === 'image').length;
          const vids = medList.filter((m) => m.media_type === 'video').length;
          const susp = repList.filter(
            (r) =>
              r.overall_assessment === 'Potentially AI-Generated' ||
              r.overall_assessment === 'Potentially Manipulated'
          ).length;

          setStats({
            totalMedia: medList.length,
            totalImages: imgs,
            totalVideos: vids,
            suspiciousMedia: susp || altList.length,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const distributionData = [
    { name: 'Likely Authentic', value: 8, color: '#10B981' },
    { name: 'AI-Generated', value: 4, color: '#EF4444' },
    { name: 'Manipulated', value: 2, color: '#F59E0B' },
    { name: 'Recycled', value: 3, color: '#3A86FF' },
    { name: 'Further Verification', value: 1, color: '#00F0FF' },
  ];

  const activityData = [
    { day: 'Mon', authentic: 4, suspicious: 1 },
    { day: 'Tue', authentic: 6, suspicious: 2 },
    { day: 'Wed', authentic: 8, suspicious: 3 },
    { day: 'Thu', authentic: 5, suspicious: 1 },
    { day: 'Fri', authentic: 9, suspicious: 4 },
    { day: 'Sat', authentic: 7, suspicious: 2 },
    { day: 'Sun', authentic: 3, suspicious: 1 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <MetricCard
          title="Total Media Analysed"
          value={stats.totalMedia}
          subtitle="Processed through forensic engine"
          icon={FileCheck2}
          accent="#00F0FF"
        />
        <MetricCard
          title="Images Verified"
          value={stats.totalImages}
          subtitle="Pixel forensics & CNN inference"
          icon={ImageIcon}
          accent="#3A86FF"
        />
        <MetricCard
          title="Videos Verified"
          value={stats.totalVideos}
          subtitle="Frame extraction & deepfake check"
          icon={VideoIcon}
          accent="#7928CA"
        />
        <MetricCard
          title="Potentially Suspicious"
          value={stats.suspiciousMedia}
          subtitle="Flagged for human audit"
          icon={AlertTriangle}
          accent="#EF4444"
          trend="Action Required"
        />
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Verification Distribution */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
            Assessment Category Distribution
          </h4>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1F2E59', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '10px' }}>
            {distributionData.map((d) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: d.color }} />
                <span>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Ingestion Activity */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
            Weekly Verification Ingestion Activity
          </h4>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={activityData}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1F2E59', borderRadius: '8px' }}
                />
                <Bar dataKey="authentic" fill="#3A86FF" radius={[4, 4, 0, 0]} name="Authentic" />
                <Bar dataKey="suspicious" fill="#EF4444" radius={[4, 4, 0, 0]} name="Suspicious" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
            Multi-modal verification pipeline throughput over the past 7 days
          </p>
        </div>
      </div>

      {/* Recent Alerts & Activity Feed Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Recent Alerts */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF' }}>Active Forensic Alerts</h4>
            <button
              onClick={() => onNavigate('alerts')}
              style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alerts.slice(0, 3).map((alt) => (
              <div
                key={alt.id}
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <StatusBadge status={alt.severity} size="sm" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#FFFFFF' }}>{alt.headline}</span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{alt.details.slice(0, 75)}...</p>
                </div>
                <button
                  onClick={() => onNavigate('alerts')}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(0, 240, 255, 0.1)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                  }}
                >
                  Review
                </button>
              </div>
            ))}
            {alerts.length === 0 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                No active critical alerts. All monitored feeds verified normal.
              </p>
            )}
          </div>
        </div>

        {/* Quick Launchpad & Social Monitoring Widget */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF' }}>Automated Social Feeds</h4>
              <StatusBadge status="Connected" size="sm" />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Monitoring authorized Reddit public channels (r/news, r/worldnews) and configured hashtags for breaking media.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                <span>r/news Authorized API</span>
                <span style={{ color: 'var(--accent-green)' }}>Active (Polling)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                <span>r/worldnews Permitted Stream</span>
                <span style={{ color: 'var(--accent-green)' }}>Active (Polling)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                <span>X / Twitter v2 Connector</span>
                <span style={{ color: 'var(--accent-cyan)' }}>Configured</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('social-monitor')}
            style={{
              marginTop: '16px',
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: 'rgba(58, 134, 255, 0.15)',
              border: '1px solid rgba(58, 134, 255, 0.4)',
              color: '#3A86FF',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Radio size={16} />
            <span>Open Social Media Monitoring Console</span>
          </button>
        </div>
      </div>

      <UncertaintyNotice />
    </div>
  );
};

export default DashboardPage;

