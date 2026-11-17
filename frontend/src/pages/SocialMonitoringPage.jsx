import React, { useEffect, useState } from 'react';
import { Radio, RefreshCw, Plus, CheckCircle, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { UncertaintyNotice } from '../components/common/UncertaintyNotice';

export const SocialMonitoringPage = () => {
  const [statusInfo, setStatusInfo] = useState(null);
  const [sources, setSources] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [pollResult, setPollResult] = useState(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [queryType, setQueryType] = useState('keyword');

  const fetchData = async () => {
    try {
      const [stRes, srcRes, kwRes, postRes] = await Promise.all([
        api.getMonitoringStatus().catch(() => ({ data: {} })),
        api.getSources().catch(() => ({ data: [] })),
        api.getKeywords().catch(() => ({ data: [] })),
        api.getDiscoveredPosts().catch(() => ({ data: [] })),
      ]);
      setStatusInfo(stRes.data);
      setSources(srcRes.data || []);
      setKeywords(kwRes.data || []);
      setPosts(postRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddKeyword = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    try {
      await api.addKeyword(newKeyword.trim(), queryType);
      setNewKeyword('');
      fetchData();
    } catch (err) {
      alert('Failed to add keyword: ' + err.message);
    }
  };

  const handlePoll = async (sourceId) => {
    setPolling(true);
    setPollResult(null);
    try {
      const res = await api.pollSource(sourceId);
      setPollResult(res.data);
      fetchData();
    } catch (err) {
      alert('Polling error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setPolling(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF' }}>
          Automated Social Media Monitoring & Media Ingestion
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Discovers breaking posts from authorized public feeds using permitted official APIs, filters eligible media attachments, prevents duplicates, and triggers the verification pipeline.
        </p>
      </div>

      {/* API Connectivity Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}>Reddit API (Authorized Read)</span>
            <StatusBadge status={statusInfo?.api_connectivity?.reddit || 'Connected'} size="sm" />
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Permitted JSON endpoint; respects User-Agent policy and rate limits.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}>X / Twitter API v2</span>
            <StatusBadge status={statusInfo?.api_connectivity?.twitter_x || 'Unavailable'} size="sm" />
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Requires official Bearer Token / OAuth credentials in settings to activate stream.
          </p>
        </div>
      </div>

      {/* Sources & Keywords Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Monitored Channels */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '14px' }}>
            Monitored Sources & Subreddits
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sources.map((src) => (
              <div
                key={src.id}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>{src.handle_or_channel}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({src.platform_name})</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Status: {src.auth_status}
                  </p>
                </div>
                <button
                  onClick={() => handlePoll(src.id)}
                  disabled={polling}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(0, 240, 255, 0.15)',
                    border: '1px solid rgba(0, 240, 255, 0.4)',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: polling ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <RefreshCw size={12} className={polling ? 'spin' : ''} />
                  <span>{polling ? 'Polling...' : 'Poll Stream'}</span>
                </button>
              </div>
            ))}
          </div>

          {pollResult && (
            <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.78rem' }}>
              <p style={{ fontWeight: 700, color: 'var(--accent-green)', marginBottom: '4px' }}>Polling Completed for {pollResult.source}</p>
              <p style={{ color: 'var(--text-secondary)' }}>
                Evaluated: {pollResult.posts_evaluated} • Ingested: {pollResult.new_media_ingested} • Skipped (Duplicates): {pollResult.duplicates_skipped}
              </p>
            </div>
          )}
        </div>

        {/* Monitored Keywords */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '14px' }}>
            Active Query Keywords & Hashtags
          </h4>

          <form onSubmit={handleAddKeyword} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="e.g. #breaking or deepfake"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: '#FFFFFF',
                fontSize: '0.8rem',
              }}
            />
            <select
              value={queryType}
              onChange={(e) => setQueryType(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: '#FFFFFF',
                fontSize: '0.78rem',
              }}
            >
              <option value="keyword">Keyword</option>
              <option value="hashtag">Hashtag</option>
            </select>
            <button
              type="submit"
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                backgroundColor: 'var(--accent-cyan)',
                border: 'none',
                color: '#070B19',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Add
            </button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {keywords.map((kw) => (
              <span
                key={kw.id}
                style={{
                  padding: '6px 10px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(58, 134, 255, 0.1)',
                  border: '1px solid rgba(58, 134, 255, 0.3)',
                  color: '#93C5FD',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {kw.keyword} <span style={{ opacity: 0.6, fontSize: '0.65rem' }}>({kw.query_type})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Discovered Posts Feed */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '14px' }}>
          Discovered Media Feed ({posts.length} Items)
        </h4>

        {posts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {posts.map((post) => (
              <div
                key={post.id}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ maxWidth: '75%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                      [{post.platform_name}] by u/{post.author}
                    </span>
                    {post.overall_assessment && (
                      <StatusBadge status={post.overall_assessment} size="sm" />
                    )}
                  </div>
                  <h5 style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 600 }}>{post.content}</h5>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>Published: {new Date(post.published_at).toLocaleString()}</span>
                    <span>Status: {post.verification_status}</span>
                  </div>
                </div>

                <a
                  href={post.post_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Open Post</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>
            No posts discovered yet. Click "Poll Stream" above to ingest live public media.
          </p>
        )}
      </div>

      <UncertaintyNotice text="Social media monitoring accesses public authorized APIs only. Media is retrieved strictly where platform permissions and rate limits allow. Posts are deduplicated using cryptographic platform IDs." />
    </div>
  );
};

export default SocialMonitoringPage;

