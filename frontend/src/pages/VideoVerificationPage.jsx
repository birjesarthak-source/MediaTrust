import React, { useState } from 'react';
import { Video, Film, Eye, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { api } from '../services/api';
import { FileUploadZone } from '../components/common/FileUploadZone';
import { StatusBadge } from '../components/common/StatusBadge';
import { UncertaintyNotice } from '../components/common/UncertaintyNotice';

export const VideoVerificationPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [sampleInterval, setSampleInterval] = useState(0.5);
  const [maxFrames, setMaxFrames] = useState(20);

  const handleFileSelect = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.uploadAndAnalyzeVideo(file);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Video analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF' }}>
          Deepfake & Video Manipulation Detection
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Samples video frames via OpenCV, localizes facial landmarks, inspects perimeter boundary discontinuities, and tracks temporal consistency over time.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            Sampling Interval: <strong>{sampleInterval}s</strong>
          </label>
          <input
            type="range"
            min="0.2"
            max="2.0"
            step="0.1"
            value={sampleInterval}
            onChange={(e) => setSampleInterval(parseFloat(e.target.value))}
            style={{ width: '140px', accentColor: 'var(--accent-cyan)' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            Max Frame Samples: <strong>{maxFrames}</strong>
          </label>
          <input
            type="range"
            min="5"
            max="40"
            step="5"
            value={maxFrames}
            onChange={(e) => setMaxFrames(parseInt(e.target.value))}
            style={{ width: '140px', accentColor: 'var(--accent-cyan)' }}
          />
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Configurable sampling balances forensic accuracy against processing latency.
        </span>
      </div>

      <FileUploadZone
        onFileSelected={handleFileSelect}
        accept="video/mp4,video/avi,video/mov,video/webm"
        label="Select Video for Deepfake Verification"
        description="Supports MP4, AVI, MOV, WEBM (Max 250MB)"
      />

      {loading && (
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(0, 240, 255, 0.2)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            Extracting video frames, executing Haar Cascade face detection, and evaluating neural boundary seams...
          </p>
        </div>
      )}

      {error && (
        <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#EF4444', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Video Overview Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Video Assessment</p>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge status={result.video_assessment} size="md" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Duration</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>{result.duration_seconds}s</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sampled Frames</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{result.sampled_frames_count} / {result.total_frames}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Faces Evaluated</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>{result.faces_detected_count}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Temporal Jitter</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>{result.temporal_jitter_score}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Suspicious Frames</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: result.suspicious_frame_count > 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                    {result.suspicious_frame_count}
                  </p>
                </div>
              </div>
            </div>

            {/* Evidence Notes */}
            <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
              <h5 style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '6px', textTransform: 'uppercase' }}>
                Aggregated Forensic Evidence
              </h5>
              <ul style={{ paddingLeft: '18px', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {result.scientific_evidence_notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sampled Frames Timeline */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '14px' }}>
              Sampled Frame Audit Timeline ({result.sampled_frames.length} Frames)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
              {result.sampled_frames.map((frame) => (
                <div
                  key={frame.frame_number}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: frame.is_suspicious ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${frame.is_suspicious ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color)'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.72rem' }}>
                    <span className="mono" style={{ color: 'var(--accent-cyan)' }}>Frame #{frame.frame_number}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{frame.timestamp_seconds}s</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Face Detected:</span>
                      <span style={{ color: frame.face_detected ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                        {frame.face_detected ? 'Yes' : 'No'}
                      </span>
                    </div>

                    {frame.face_detected && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Deepfake Prob:</span>
                          <span style={{ fontWeight: 700, color: frame.deepfake_probability >= 0.60 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                            {(frame.deepfake_probability * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Boundary Seam:</span>
                          <span>{frame.boundary_discontinuity_score}</span>
                        </div>
                      </>
                    )}

                    <div style={{ marginTop: '6px' }}>
                      <StatusBadge status={frame.is_suspicious ? 'Suspicious' : 'Normal'} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <UncertaintyNotice text="Basic face detection or frame extraction alone does not prove video manipulation. Video assessments aggregate statistical distributions across temporal intervals." />
        </div>
      )}
    </div>
  );
};

export default VideoVerificationPage;

