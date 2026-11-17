import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Award, History, Info, KeyRound } from 'lucide-react';
import { api } from '../services/api';
import { FileUploadZone } from '../components/common/FileUploadZone';
import { StatusBadge } from '../components/common/StatusBadge';
import { UncertaintyNotice } from '../components/common/UncertaintyNotice';

export const C2PAPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const upRes = await api.uploadMedia(file);
      const mediaId = upRes.data.media_id;
      const res = await api.verifyC2PA(mediaId);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'C2PA verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF' }}>
          C2PA Digital Provenance & Content Credentials
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Validates cryptographic signatures and provenance manifests defined by the Coalition for Content Provenance and Authenticity (C2PA).
        </p>
      </div>

      <FileUploadZone
        onFileSelected={handleFileSelect}
        accept="image/*,video/mp4"
        label="Select Media to Verify C2PA Content Credentials"
        description="Inspects JUMBF boxes, digital signatures, and asset lineage"
      />

      {loading && (
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(0, 240, 255, 0.2)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            Scanning JUMBF container boxes, parsing assertion tree, and verifying signing certificates...
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
          {/* C2PA Status Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>C2PA Manifest State</p>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge status={result.validation_status} size="md" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Claim Generator</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF' }}>{result.claim_generator || 'None'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Signing Authority</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>{result.signing_issuer || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Manifest Present</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: result.manifest_present ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    {result.manifest_present ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              {result.c2pa_summary}
            </p>

            {result.certificate_digest && (
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <KeyRound size={14} color="var(--accent-cyan)" />
                <span className="mono">Cert Fingerprint: {result.certificate_digest}</span>
              </div>
            )}
          </div>

          {/* Action Assertion Lineage */}
          {result.assertion_actions && result.assertion_actions.length > 0 && (
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <History size={18} color="var(--accent-cyan)" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF' }}>
                  Provenanced Edit & Ingestion History
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {result.assertion_actions.map((act, index) => (
                  <div
                    key={index}
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
                      <span className="mono" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {act.action}
                      </span>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Software Agent: {act.software_agent || 'Standard Producer'}
                      </p>
                    </div>
                    {act.parameters && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {act.parameters.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <UncertaintyNotice text={result.epistemic_disclaimer} />
        </div>
      )}
    </div>
  );
};

export default C2PAPage;

