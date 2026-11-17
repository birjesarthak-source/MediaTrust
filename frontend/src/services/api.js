import axios from 'axios';

const rawBase = import.meta.env.VITE_API_URL || '';
const API_BASE = rawBase 
  ? (rawBase.endsWith('/api/v1') ? rawBase : `${rawBase.replace(/\/$/, '')}/api/v1`)
  : '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const api = {
  // Health
  getHealth: () => apiClient.get('/health'),

  // Media
  uploadMedia: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getMediaDetails: (mediaId) => apiClient.get(`/media/${mediaId}`),
  listMedia: () => apiClient.get('/media'),

  // Module A: Pixel Analysis
  runPixelAnalysis: (mediaId) => apiClient.post(`/analysis/pixel/${mediaId}`),
  uploadAndAnalyzePixel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/analysis/pixel-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Module A: AI Image Detection (PyTorch)
  runAIImageDetection: (mediaId) => apiClient.post(`/analysis/ai-image/${mediaId}`),
  uploadAndDetectAIImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/analysis/ai-image-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Module B: Video & Deepfake
  runVideoAnalysis: (mediaId, sampleInterval = 0.5, maxSamples = 20) =>
    apiClient.post(`/analysis/video/${mediaId}?sample_interval_sec=${sampleInterval}&max_samples=${maxSamples}`),
  getVideoFrames: (mediaId) => apiClient.get(`/analysis/video/${mediaId}/frames`),
  uploadAndAnalyzeVideo: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/analysis/video-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Module C & D: Metadata & C2PA
  getMetadata: (mediaId) => apiClient.post(`/forensics/metadata/${mediaId}`),
  verifyC2PA: (mediaId) => apiClient.post(`/forensics/c2pa/${mediaId}`),

  // Module E & F: Recycled & Compression
  checkRecycledMedia: (mediaId, maxDistance = 14) =>
    apiClient.post(`/forensics/recycled/${mediaId}?max_hamming_distance=${maxDistance}`),
  getReferenceCatalog: () => apiClient.get('/forensics/recycled/reference-index'),
  checkCompression: (mediaId) => apiClient.post(`/forensics/compression/${mediaId}`),

  // Module G & H: Reports & Alerts
  generateReport: (mediaId) => apiClient.post(`/reports/generate/${mediaId}`),
  getReport: (reportId) => apiClient.get(`/reports/${reportId}`),
  listReports: () => apiClient.get('/reports'),
  listAlerts: (severity, ack) => {
    let url = '/alerts?';
    if (severity) url += `severity=${severity}&`;
    if (ack !== undefined) url += `acknowledged=${ack}&`;
    return apiClient.get(url);
  },
  acknowledgeAlert: (alertId, notes) => apiClient.patch(`/alerts/${alertId}/acknowledge`, { notes }),

  // Social Monitoring
  getMonitoringStatus: () => apiClient.get('/social-monitor/status'),
  getSources: () => apiClient.get('/social-monitor/sources'),
  addSource: (platform, channel) => apiClient.post('/social-monitor/sources', { platform_name: platform, handle_or_channel: channel }),
  getKeywords: () => apiClient.get('/social-monitor/keywords'),
  addKeyword: (keyword, queryType) => apiClient.post('/social-monitor/keywords', { keyword, query_type: queryType }),
  pollSource: (sourceId) => apiClient.post(`/social-monitor/poll?source_id=${sourceId}`),
  getDiscoveredPosts: () => apiClient.get('/social-monitor/posts'),
};
