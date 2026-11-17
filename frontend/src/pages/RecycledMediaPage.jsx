import React, { useState } from 'react';
import { Repeat, Hash, Search, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { FileUploadZone } from '../components/common/FileUploadZone';
import { StatusBadge } from '../components/common/StatusBadge';
import { UncertaintyNotice } from '../components/common/UncertaintyNotice';

export const RecycledMediaPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [hammingThreshold, setHammingThreshold] = useState(14);

  const handleFileSelect = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const upRes = await api.uploadMedia(file);
      const mediaId = upRes.data.media_id;
      const res = await api.checkRecycledMedia(mediaId, hammingThreshold);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Recycled media check failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF' }}>
          Recycled Media & Perceptual Hashing
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Generates 64-bit perceptual hashes (pHash, dHash, aHash) and evaluates bitwise Hamming distances against indexed historical reference media.
        </p>
      </div>

      {/* Threshold Slider */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            Max Hamming Distance: <strong>{hammingThreshold} bits</strong>
          </label>
          <input
            type="range"
            min="2"
            max="24"
            value={hammingThreshold}
            onChange={(e) => setHammingThreshold(parseInt(e.target.value))}
            style={{ width: '160px', accentColor: 'var(--accent-cyan)' }}
          />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Distance &le; 6 represents high visual similarity; &le; 12 represents potential re-circulation with crop/re-compression.
        </p>
      </div>

      <FileUploadZone
        onFileSelected={handleFileSelect}
        accept="image/*"
        label="Select Image to Check for Recycled Circulation"
        description="Extracts pHash, dHash, aHash and queries reference index"
      />

      {loading && (
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(0, 240, 255, 0.2)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            Computing 2D DCT Perceptual Hashes and evaluating Hamming distances across catalog...
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
          {/* Hashes Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Hash size={20} color="var(--accent-cyan)" />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF' }}>Perceptual Fingerprints</h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>DCT Perceptual Hash (pHash)</p>
                <p className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '4px' }}>
                  {result.hashes.phash}
                </p>
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Difference Gradient Hash (dHash)</p>
                <p className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3A86FF', marginTop: '4px' }}>
                  {result.hashes.dhash}
                </p>
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Average Luminance Hash (aHash)</p>
                <p className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10B981', marginTop: '4px' }}>
                  {result.hashes.ahash}
                </p>
              </div>
            </div>
          </div>

          {/* Reference Matches */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF' }}>
                Reference Collection Matches ({result.matches_found})
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Internal Verified Archive
              </span>
            </div>

            {result.matches.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {result.matches.map((match) => (
                  <div
                    key={match.reference_id}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color)',
                      borderLeft: '4px solid var(--accent-blue)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>{match.reference_title}</h5>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{match.reference_origin}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                          {match.similarity_percentage}%
                        </span>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hamming Dist: {match.hamming_distance}</p>
                      </div>
                    </div>

                    {match.known_context && (
                      <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(58, 134, 255, 0.08)', border: '1px solid rgba(58, 134, 255, 0.2)', fontSize: '0.76rem', color: '#93C5FD' }}>
                        <strong>Circulation Note:</strong> {match.known_context}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>
                No visual matches found in the indexed reference collection at Hamming distance threshold &le; {hammingThreshold}.
              </p>
            )}
          </div>

          <UncertaintyNotice text={result.reference_database_scope} />
        </div>
      )}
    </div>
  );
};

export default RecycledMediaPage;

