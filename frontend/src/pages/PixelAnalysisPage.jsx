import React, { useState } from 'react';
import { Cpu, Activity, BarChart2, Layers, AlertCircle } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../services/api';
import { FileUploadZone } from '../components/common/FileUploadZone';
import { UncertaintyNotice } from '../components/common/UncertaintyNotice';

export const PixelAnalysisPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeChannel, setActiveChannel] = useState('r');

  const handleFileSelect = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.uploadAndAnalyzePixel(file);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Pixel analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare histogram data for Recharts (subsampled to 64 bins for chart rendering)
  const chartData = result
    ? Array.from({ length: 64 }, (_, i) => {
        const binIndex = i * 4;
        return {
          bin: binIndex,
          red: result.histograms.r.slice(binIndex, binIndex + 4).reduce((a, b) => a + b, 0),
          green: result.histograms.g.slice(binIndex, binIndex + 4).reduce((a, b) => a + b, 0),
          blue: result.histograms.b.slice(binIndex, binIndex + 4).reduce((a, b) => a + b, 0),
        };
      })
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF' }}>
          Pixel-Level Image Forensics & Frequency Domain
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Mathematical inspection of RGB intensity distributions, Laplacian edge sharpness, local texture entropy, sensor noise residuals, and Error Level Analysis (ELA).
        </p>
      </div>

      <FileUploadZone
        onFileSelected={handleFileSelect}
        accept="image/jpeg,image/png,image/webp"
        label="Select Image for Pixel Forensics"
        description="Inspects RAW RGB matrices, ELA, and 2D-FFT frequency spectrum"
      />

      {loading && (
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(0, 240, 255, 0.2)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            Computing 256-bin RGB Histograms, Sobel Gradients, Median Filter Noise Residuals & 2D-FFT...
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
          {/* Dimensions & Channel Statistics */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
              Channel Pixel Statistics ({result.dimensions.width}x{result.dimensions.height} • {result.dimensions.total_pixels.toLocaleString()} Pixels)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {Object.entries(result.channel_statistics).map(([channel, stats]) => {
                const color = channel === 'red' ? '#EF4444' : channel === 'green' ? '#10B981' : '#3A86FF';
                return (
                  <div
                    key={channel}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid var(--border-color)`,
                      borderTop: `3px solid ${color}`,
                    }}
                  >
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color, textTransform: 'capitalize', marginBottom: '10px' }}>
                      {channel} Channel
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
                      <div><span style={{ color: 'var(--text-muted)' }}>Mean:</span> <strong>{stats.mean}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Std Dev:</span> <strong>{stats.std_dev}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Median:</span> <strong>{stats.median}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Skewness:</span> <strong>{stats.skewness}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Min:</span> <strong>{stats.min}</strong></div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Max:</span> <strong>{stats.max}</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 256-Bin RGB Color Histogram Chart */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF' }}>
                Color Intensity Distribution (256-Bin Multi-Channel Histogram)
              </h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['r', 'g', 'b'].map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setActiveChannel(ch)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: activeChannel === ch ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${activeChannel === ch ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                      color: activeChannel === ch ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {ch === 'r' ? 'Red' : ch === 'g' ? 'Green' : 'Blue'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: '220px', width: '100%' }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <XAxis dataKey="bin" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1F2E59', borderRadius: '8px' }}
                  />
                  {activeChannel === 'r' && (
                    <Area type="monotone" dataKey="red" stroke="#EF4444" fill="rgba(239, 68, 68, 0.2)" name="Red Channel" />
                  )}
                  {activeChannel === 'g' && (
                    <Area type="monotone" dataKey="green" stroke="#10B981" fill="rgba(16, 185, 129, 0.2)" name="Green Channel" />
                  )}
                  {activeChannel === 'b' && (
                    <Area type="monotone" dataKey="blue" stroke="#3A86FF" fill="rgba(58, 134, 255, 0.2)" name="Blue Channel" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Forensic Metrics Grid: ELA, Edges, Texture, Noise, 2D-FFT */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {/* ELA */}
            <div className="glass-card" style={{ padding: '18px' }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '10px' }}>
                Error Level Analysis (ELA)
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tested JPEG Quality:</span>
                  <strong>{result.error_level_analysis.ela_quality_tested}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Mean Divergence:</span>
                  <strong>{result.error_level_analysis.ela_mean_divergence}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Max Divergence:</span>
                  <strong>{result.error_level_analysis.ela_max_divergence}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Uniformity Score:</span>
                  <strong>{result.error_level_analysis.divergence_uniformity_score}</strong>
                </div>
              </div>
            </div>

            {/* Edge Analysis */}
            <div className="glass-card" style={{ padding: '18px' }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3A86FF', marginBottom: '10px' }}>
                Edge & Sharpness Forensics
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Laplacian Variance:</span>
                  <strong>{result.edge_analysis.laplacian_variance}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Edge Density Ratio:</span>
                  <strong>{(result.edge_analysis.edge_density * 100).toFixed(2)}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Sobel Gradient Mean:</span>
                  <strong>{result.edge_analysis.sobel_gradient_mean}</strong>
                </div>
              </div>
            </div>

            {/* Noise & Texture */}
            <div className="glass-card" style={{ padding: '18px' }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10B981', marginBottom: '10px' }}>
                Sensor Noise & Texture Entropy
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Noise Variance Residual:</span>
                  <strong>{result.noise_analysis.noise_variance}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Signal-to-Noise Ratio:</span>
                  <strong>{result.noise_analysis.snr_db} dB</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shannon Entropy:</span>
                  <strong>{result.texture_analysis.shannon_entropy}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Local Texture Score:</span>
                  <strong>{result.texture_analysis.texture_score}</strong>
                </div>
              </div>
            </div>

            {/* 2D-FFT Frequency */}
            <div className="glass-card" style={{ padding: '18px' }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-purple)', marginBottom: '10px' }}>
                2D-FFT Frequency Domain
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Spectral Energy:</span>
                  <strong>{result.frequency_analysis.fft_total_energy.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>High-to-Low Ratio:</span>
                  <strong>{result.frequency_analysis.high_to_low_energy_ratio}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>High Frequency Share:</span>
                  <strong>{(result.frequency_analysis.high_frequency_ratio * 100).toFixed(2)}%</strong>
                </div>
              </div>
            </div>
          </div>

          <UncertaintyNotice text="Pixel analysis indicators provide objective physical measurements of image composition. These metrics serve as evidence and are kept strictly distinct from neural model classifications." />
        </div>
      )}
    </div>
  );
};

export default PixelAnalysisPage;

