import React, { useState } from 'react';
import { FileText, Camera, MapPin, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { api } from '../services/api';
import { FileUploadZone } from '../components/common/FileUploadZone';
import { StatusBadge } from '../components/common/StatusBadge';
import { UncertaintyNotice } from '../components/common/UncertaintyNotice';

export const MetadataAnalysisPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const upRes = await api.uploadMedia(file);
      const mediaId = upRes.data.media_id;
      const res = await api.getMetadata(mediaId);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Metadata extraction failed.');
    } finally {
      setLoading(false);
    }
  };

  const imgMeta = result?.image_metadata;
  const vidMeta = result?.video_metadata;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF' }}>
          Multimedia Metadata & EXIF Analysis
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Extracts camera make/model, capture timestamp, editing software tags, and GPS coordinates. Evaluates metadata stripping and container consistency.
        </p>
      </div>

      <FileUploadZone
        onFileSelected={handleFileSelect}
        accept="image/*,video/*"
        label="Select Image or Video for Metadata Extraction"
        description="Inspects EXIF, IPTC, GPS, and Video Stream headers"
      />

      {loading && (
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(0, 240, 255, 0.2)', borderTopColor: 'var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            Parsing binary EXIF tags, GPS rational coordinates, and container headers...
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
          {/* Hardware & Software Indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {/* Camera Hardware Card */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Camera size={20} color="var(--accent-cyan)" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF' }}>Hardware & Capture Profile</h4>
              </div>

              {imgMeta ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Camera Make:</span>
                    <strong>{imgMeta.camera_make || 'Not Recorded'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Camera Model:</span>
                    <strong>{imgMeta.camera_model || 'Not Recorded'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Lens Model:</span>
                    <strong>{imgMeta.lens_model || 'Not Recorded'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>ISO Speed:</span>
                    <strong>{imgMeta.iso ? `ISO ${imgMeta.iso}` : 'N/A'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Aperture / F-Number:</span>
                    <strong>{imgMeta.f_number ? `f/${imgMeta.f_number}` : 'N/A'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Creation Timestamp:</span>
                    <strong>{imgMeta.creation_date || 'Absent'}</strong>
                  </div>
                </div>
              ) : vidMeta ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Codec:</span>
                    <strong>{vidMeta.codec}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Frame Rate:</span>
                    <strong>{vidMeta.fps} FPS</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
                    <strong>{vidMeta.duration_seconds}s</strong>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Software Editing Footprint Card */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <FileText size={20} color="var(--accent-amber)" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF' }}>Software & Integrity State</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Editing Software:</span>
                  <strong style={{ color: imgMeta?.software ? 'var(--accent-amber)' : '#FFFFFF' }}>
                    {imgMeta?.software || 'None Declared'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>EXIF Stripping:</span>
                  <StatusBadge status={imgMeta?.metadata_stripped ? 'Stripped / Scrubbed' : 'Preserved'} size="sm" />
                </div>

                {imgMeta?.gps && (imgMeta.gps.latitude || imgMeta.gps.longitude) ? (
                  <div style={{ marginTop: '10px', padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(0, 240, 255, 0.08)', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                      <MapPin size={16} />
                      <strong>GPS Coordinates Attached</strong>
                    </div>
                    <p className="mono" style={{ fontSize: '0.75rem', color: '#FFFFFF' }}>
                      Lat: {imgMeta.gps.latitude}, Lon: {imgMeta.gps.longitude}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '8px' }}>
                    <MapPin size={14} />
                    <span>No geolocation coordinates attached</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Anomalies and Observations */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
              Forensic Observations & Flags
            </h4>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {result.anomalies_and_flags.map((flag, idx) => (
                <li key={idx}>{flag}</li>
              ))}
              {result.anomalies_and_flags.length === 0 && (
                <li>No suspicious metadata anomalies detected.</li>
              )}
            </ul>
          </div>

          <UncertaintyNotice text="Metadata can be easily stripped or modified by social platforms for user privacy. The absence of camera make or timestamps does NOT imply that the image has been manipulated." />
        </div>
      )}
    </div>
  );
};

export default MetadataAnalysisPage;

