import React, { useEffect, useState } from 'react';
import { FileCheck2, Shield, AlertTriangle, CheckCircle, Info, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { UncertaintyNotice } from '../components/common/UncertaintyNotice';

export const VerificationReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.listReports();
        const data = res.data || [];
        setReports(data);
        if (data.length > 0) {
          setSelectedReport(data[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF' }}>
          Forensic Verification Reports & Evidence Audit
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Transparent, explainable verification reports synthesizing AI model logits, pixel matrices, C2PA digital provenance, and compression indicators.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '20px' }}>
        {/* Reports Index */}
        <div className="glass-card" style={{ padding: '16px', maxHeight: '700px', overflowY: 'auto' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '12px' }}>
            Archived Audit Reports ({reports.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {reports.map((rep) => {
              const isSelected = selectedReport?.report_id === rep.report_id;
              return (
                <div
                  key={rep.report_id}
                  onClick={() => setSelectedReport(rep)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                      {rep.filename}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {(rep.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <StatusBadge status={rep.overall_assessment} size="sm" />
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {new Date(rep.generated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}

            {reports.length === 0 && !loading && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>
                No reports generated yet. Run an analysis on an uploaded file to synthesize an audit report.
              </p>
            )}
          </div>
        </div>

        {/* Selected Report Detail View */}
        {selectedReport ? (
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                  AUDIT ID: {selectedReport.report_id}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
                  {selectedReport.filename}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Media Type: {selectedReport.media_type.toUpperCase()} • Generated: {new Date(selectedReport.generated_at).toLocaleString()}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Assessment</p>
                <div style={{ marginTop: '4px' }}>
                  <StatusBadge status={selectedReport.overall_assessment} size="md" />
                </div>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '4px' }}>
                  Calibrated Confidence: {(selectedReport.confidence_score * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Key Evidence Bullets */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Key Evidence Supporting Assessment
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedReport.key_evidence.map((ev, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)', marginTop: '8px', flexShrink: 0 }} />
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Module Findings Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>C2PA Provenance</p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>
                  {selectedReport.module_summaries.c2pa_status || 'Unavailable'}
                </p>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>EXIF Metadata</p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>
                  {selectedReport.module_summaries.metadata_stripped ? 'Privacy Stripped' : 'Preserved'}
                </p>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Recycled Media</p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>
                  {selectedReport.module_summaries.recycled_matches_count} Matches Found
                </p>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Compression Footprint</p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF', marginTop: '2px' }}>
                  {selectedReport.module_summaries.compression_severity || 'Standard'}
                </p>
              </div>
            </div>

            {/* Human Verification Recommendation */}
            <div style={{ padding: '14px 18px', borderRadius: '8px', backgroundColor: 'rgba(58, 134, 255, 0.08)', border: '1px solid rgba(58, 134, 255, 0.3)' }}>
              <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Recommendation for Fact-Checking & Human Analysts
              </h5>
              <p style={{ fontSize: '0.82rem', color: '#E2E8F0', lineHeight: 1.5 }}>
                {selectedReport.human_verification_recommendation}
              </p>
            </div>

            <UncertaintyNotice text={selectedReport.uncertainty_and_limitations} />
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select an audit report from the left panel.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationReportsPage;

