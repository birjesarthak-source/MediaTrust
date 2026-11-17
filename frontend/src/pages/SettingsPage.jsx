import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Users, 
  Key, 
  Sliders, 
  Server, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Save,
  Info
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';

export default function SettingsPage() {
  const [dbConfig, setDbConfig] = useState({
    host: 'localhost',
    port: '3306',
    database: 'mediatrust_db',
    user: 'root',
    status: 'Connected (Fallback JSON Store Active)'
  });

  const [aiConfig, setAiConfig] = useState({
    imageModel: 'ForensicSyntheticDetectorCNN (PyTorch 2.15)',
    videoModel: 'ForensicDeepfakeFaceCNN (PyTorch + Haar Cascade)',
    samplingRate: '1.0 fps (1 frame per second)',
    maxFrames: '20 frames per video',
    confidenceThreshold: '0.65',
    fftResolution: '512x512',
    enableGPU: false
  });

  const [socialApiConfig, setSocialApiConfig] = useState({
    redditClientId: 'rd_sec_9942a8b',
    redditUserAgent: 'MediaTrustAI:v1.0 (academic research by college team)',
    xApiKey: '••••••••••••••••••••••••',
    rateLimitGuard: true,
    respectRobotsTxt: true
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const teamMembers = [
    {
      name: "Team Member 1",
      role: "AI/ML & Computer Vision Lead",
      focus: "Module A (Synthetic Image Detector CNN) & Module B (Deepfake Face Detector & Frame Forensics)",
      components: [
        "ForensicSyntheticDetectorCNN (PyTorch)",
        "ForensicDeepfakeFaceCNN (PyTorch)",
        "Spatial Boundary & Temporal Jitter Analysis",
        "Pixel Forensics (ELA, FFT, Laplacian, Color Histograms)"
      ],
      color: "border-cyan-500/40 text-cyan-400"
    },
    {
      name: "Team Member 2",
      role: "Digital Forensics & Provenance Lead",
      focus: "Module C (EXIF & Codec Metadata), Module D (C2PA Provenance) & Module E/F (Perceptual Hashing & Compression)",
      components: [
        "Pillow & ExifTool Metadata Parser",
        "C2PA JUMBF Manifest Scanner",
        "Perceptual Multi-Hashing (pHash, dHash, aHash)",
        "JPEG Quantization Matrix & Q-Factor Analyzer"
      ],
      color: "border-indigo-500/40 text-indigo-400"
    },
    {
      name: "Team Member 3",
      role: "Full-Stack, Integration & Monitoring Lead",
      focus: "Module G (Evidence Fusion Engine), Module H (Alert System), Module 4 (Social Monitor) & React Dashboard",
      components: [
        "FastAPI Asynchronous Gateway & Routing",
        "Bayesian Multimodal Evidence Fusion Service",
        "Official Social Media Connectors (Reddit/X)",
        "React Cybersecurity Dashboard & Visualizations"
      ],
      color: "border-purple-500/40 text-purple-400"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-700/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            <SettingsIcon className="w-7 h-7 text-cyan-400" />
            System Configuration & Team Architecture
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Global system parameters, model runtime configs, database connections, and 3-member team role allocations.
          </p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-semibold rounded-lg shadow-lg shadow-cyan-500/10 transition-all text-sm self-start"
        >
          {savedSuccess ? <CheckCircle2 className="w-4 h-4 text-navy-950" /> : <Save className="w-4 h-4" />}
          {savedSuccess ? "Settings Applied" : "Save Configurations"}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-sm text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Configuration preferences updated in runtime context.
        </div>
      )}

      {/* 3-Member Team Architecture Showcase */}
      <div className="bg-navy-900/60 border border-navy-700/60 rounded-xl p-5 shadow-lg backdrop-blur-sm">
        <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-cyan-400" />
          College Capstone Project: 3-Member Team Specialization Architecture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teamMembers.map((member, i) => (
            <div key={i} className={`p-4 rounded-lg bg-navy-950/70 border ${member.color} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-navy-800">
                    Member {i + 1}
                  </span>
                  <StatusBadge status="ACTIVE" size="sm" />
                </div>
                <h3 className="font-semibold text-slate-100 text-sm mb-1">{member.name}</h3>
                <p className="text-xs text-cyan-400 font-medium mb-3">{member.role}</p>
                <p className="text-xs text-slate-300 mb-3">{member.focus}</p>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block">Key Implementations:</span>
                  {member.components.map((comp, idx) => (
                    <div key={idx} className="text-xs text-slate-400 flex items-start gap-1.5">
                      <span className="text-cyan-400 shrink-0">•</span>
                      <span>{comp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database & Storage */}
        <div className="bg-navy-900/60 border border-navy-700/60 rounded-xl p-5 shadow-lg backdrop-blur-sm space-y-4">
          <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            Database & Persistence Layer
          </h2>
          <div className="p-3 bg-navy-950/80 border border-navy-800 rounded-lg text-xs font-mono space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span>Target RDBMS:</span>
              <span className="text-slate-200 font-semibold">MySQL 8.0 / PyMySQL</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Connection Status:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Active with Local Persistence Fallback
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Local Storage Path:</span>
              <span className="text-cyan-400">d:/MediaTrust/data/uploads/</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Schema Definition:</span>
              <span className="text-slate-300">d:/MediaTrust/database/schema.sql (12 Tables)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Host</label>
              <input 
                type="text" 
                value={dbConfig.host} 
                onChange={(e) => setDbConfig({...dbConfig, host: e.target.value})}
                className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Port</label>
              <input 
                type="text" 
                value={dbConfig.port} 
                onChange={(e) => setDbConfig({...dbConfig, port: e.target.value})}
                className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Database Name</label>
              <input 
                type="text" 
                value={dbConfig.database} 
                onChange={(e) => setDbConfig({...dbConfig, database: e.target.value})}
                className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Database User</label>
              <input 
                type="text" 
                value={dbConfig.user} 
                onChange={(e) => setDbConfig({...dbConfig, user: e.target.value})}
                className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none" 
              />
            </div>
          </div>
        </div>

        {/* AI & Forensics Engine Parameters */}
        <div className="bg-navy-900/60 border border-navy-700/60 rounded-xl p-5 shadow-lg backdrop-blur-sm space-y-4">
          <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            AI Model Inference & Sampling Settings
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Synthetic Image Model Architecture</label>
              <input 
                type="text" 
                readOnly
                value={aiConfig.imageModel} 
                className="w-full bg-navy-950 border border-navy-800 rounded p-2 text-slate-300 font-mono" 
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Deepfake Detection Backbone</label>
              <input 
                type="text" 
                readOnly
                value={aiConfig.videoModel} 
                className="w-full bg-navy-950 border border-navy-800 rounded p-2 text-slate-300 font-mono" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Video Sampling Rate</label>
                <select 
                  value={aiConfig.samplingRate} 
                  onChange={(e) => setAiConfig({...aiConfig, samplingRate: e.target.value})}
                  className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option>0.5 fps (Fast triage)</option>
                  <option>1.0 fps (1 frame per second)</option>
                  <option>2.0 fps (High density)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Max Sample Frames</label>
                <select 
                  value={aiConfig.maxFrames} 
                  onChange={(e) => setAiConfig({...aiConfig, maxFrames: e.target.value})}
                  className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option>10 frames per video</option>
                  <option>20 frames per video</option>
                  <option>50 frames per video</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media API Credentials */}
        <div className="bg-navy-900/60 border border-navy-700/60 rounded-xl p-5 shadow-lg backdrop-blur-sm space-y-4">
          <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            Social Media API Authentication (OAuth 2.0)
          </h2>
          <p className="text-xs text-slate-400">
            Configure official API credentials for platform-authorized discovery. MediaTrust strictly respects platform terms of service and robots.txt.
          </p>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Reddit OAuth2 App Client ID</label>
              <input 
                type="text" 
                value={socialApiConfig.redditClientId} 
                onChange={(e) => setSocialApiConfig({...socialApiConfig, redditClientId: e.target.value})}
                className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-slate-200 font-mono focus:border-cyan-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Custom User-Agent</label>
              <input 
                type="text" 
                value={socialApiConfig.redditUserAgent} 
                onChange={(e) => setSocialApiConfig({...socialApiConfig, redditUserAgent: e.target.value})}
                className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-slate-200 font-mono focus:border-cyan-500 focus:outline-none" 
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">X (Twitter) v2 Bearer Token</label>
              <input 
                type="password" 
                value={socialApiConfig.xApiKey} 
                onChange={(e) => setSocialApiConfig({...socialApiConfig, xApiKey: e.target.value})}
                className="w-full bg-navy-950 border border-navy-700 rounded p-2 text-slate-200 font-mono focus:border-cyan-500 focus:outline-none" 
              />
            </div>
          </div>
        </div>

        {/* Forensic Standards & Epistemic Guardrails */}
        <div className="bg-navy-900/60 border border-navy-700/60 rounded-xl p-5 shadow-lg backdrop-blur-sm space-y-4">
          <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Forensic Guardrails & Ethical Standards
          </h2>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-navy-950/80 border border-navy-800 rounded-lg space-y-2">
              <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                Epistemic Non-Binary Classification
              </div>
              <p className="text-slate-400">
                MediaTrust AI never outputs binary Real/Fake flags. All evaluations emit confidence bounds, uncertainty flags, and human-in-the-loop escalation advice.
              </p>
            </div>

            <div className="p-3 bg-navy-950/80 border border-navy-800 rounded-lg space-y-2">
              <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Missing Metadata Neutrality Principle
              </div>
              <p className="text-slate-400">
                Stripped EXIF and missing C2PA credentials indicate privacy protection or compression rather than malicious tampering. The evidence fusion engine guarantees neutral scoring.
              </p>
            </div>

            <div className="p-3 bg-navy-950/80 border border-navy-800 rounded-lg space-y-2">
              <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Server className="w-4 h-4" />
                Catalog-Bounded Recycled Media Matching
              </div>
              <p className="text-slate-400">
                Perceptual hashing searches against the system's verified local reference catalog, explicitly informing analysts that external uncataloged instances are out of scope.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
