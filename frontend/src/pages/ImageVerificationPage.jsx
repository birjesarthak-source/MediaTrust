import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Cpu, Activity, Clock, Zap } from 'lucide-react';
import { api } from '../services/api';
import { FileUploadZone } from '../components/common/FileUploadZone';
import { StatusBadge } from '../components/common/StatusBadge';
import { UncertaintyNotice } from '../components/common/UncertaintyNotice';

export const ImageVerificationPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = async (file) => {
    setImagePreview(URL.createObjectURL(file));
    setLoading(true);
    setError(null);
    try {
      const res = await api.uploadAndDetectAIImage(file);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Image AI verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF' }}>
          AI-Generated Image Detection
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Evaluates images using a fine-tuned PyTorch CNN architecture, 2D-FFT frequency spectrum grid inspection, and spatial residual analysis.
        </p>
      </div>

      <FileUploadZone
        onFileSelected={handleFileSelect}
        accept="image/jpeg,image/png,image/webp,image/tiff"
        label="Select Image for AI Synthesis Detection"
        description="Supports JPG, JPEG, PNG, WEBP (Max 50MB)"
      />

      {loading && (
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(0, 240, 255, 0.2)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            Executing PyTorch CNN Forward Pass & 2D-FFT Spectral Peak Inspection...
          </p>
        </div>
      )}

      {error && (
        <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#EF4444', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Image Preview & Core Verdict */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '14px' }}>
              Media Inspection & Prediction
            </h4>
            {imagePreview && (
              <div style={{ borderRadius: '8px', overflow: 'hidden', maxHeight: '280px', display: 'flex', justifyContent: 'center', backgroundColor: '#000', marginBottom: '16px' }}>
                <img src={imagePreview} alt="Target Inspection" style={{ maxHeight: '280px', maxWidth: '100%', objectFit: 'contain' }} />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
              <div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Classification</p>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge status={result.prediction} size="md" />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Confidence</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {(result.confidence_score * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Probability Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--accent-red)' }}>Synthetic / AI-Generated Probability</span>
                  <span style={{ fontWeight: 700 }}>{(result.synthetic_probability * 100).toFixed(1)}%</span>
                </div>
                <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{ width: `${result.synthetic_probability * 100}%`, height: '100%', backgroundColor: 'var(--accent-red)', transition: 'width 0.5s ease' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--accent-green)' }}>Authentic Camera Capture Probability</span>
                  <span style={{ fontWeight: 700 }}>{(result.authentic_probability * 100).toFixed(1)}%</span>
                </div>
                <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{ width: `${result.authentic_probability * 100}%`, height: '100%', backgroundColor: 'var(--accent-green)', transition: 'width 0.5s ease' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Forensic Feature Indicators */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF' }}>Neural & Spectral Indicators</h4>
                <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                  {result.model_name}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Spectral Grid Artifacts</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: result.spectral_artifacts.synthetic_grid_detected ? 'var(--accent-red)' : 'var(--accent-green)', marginTop: '4px' }}>
                    {result.spectral_artifacts.synthetic_grid_detected ? 'Detected (Periodic Peaks)' : 'Normal Radial Decay'}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {result.spectral_artifacts.fft_peak_count} anomalous frequency peaks
                  </p>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Spatial Residual Variance</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
                    {result.spatial_residuals.residual_variance}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Mean residual: {result.spatial_residuals.mean_spatial_residual}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                <Clock size={14} />
                <span>PyTorch Inference Latency: {result.inference_latency_ms} ms</span>
              </div>

              {/* Explainability bullets */}
              <h5 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Explainable Forensic Evidence
              </h5>
              <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {result.explainability.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <UncertaintyNotice text={result.uncertainty_and_limitations} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageVerificationPage;

