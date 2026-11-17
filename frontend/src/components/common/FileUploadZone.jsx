import React, { useRef, useState } from 'react';
import { UploadCloud, FileCheck, AlertCircle } from 'lucide-react';

export const FileUploadZone = ({ onFileSelected, accept = 'image/*', label = 'Upload Media for Forensic Analysis', description = 'Supports JPG, PNG, WEBP, MP4 (Max 50MB)' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelected(file);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelected(file);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
      style={{
        border: `2px dashed ${dragActive ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
        borderRadius: '12px',
        padding: '36px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: dragActive ? 'rgba(0, 240, 255, 0.05)' : 'rgba(17, 28, 61, 0.6)',
        transition: 'all 0.2s ease',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            padding: '14px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 240, 255, 0.1)',
            color: 'var(--accent-cyan)',
          }}
        >
          {selectedFile ? <FileCheck size={28} /> : <UploadCloud size={28} />}
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '4px' }}>
            {selectedFile ? selectedFile.name : label}
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for Ingestion` : description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUploadZone;

