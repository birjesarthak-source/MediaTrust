# MediaTrust AI
## AI-Powered Multimedia Authenticity and Misinformation Detection System
**A Modular Digital Forensics, Provenance Verification & Misinformation Detection Platform**
*Engineered as a Capstone Major Project by a 3-Member Engineering Team*

---

## 1. Executive Summary & Objective

In modern social media ecosystems, the proliferation of deepfakes, diffusion-model generated synthetic imagery, recycled out-of-context historical media, and manipulated audiovisual streams presents a profound challenge to information integrity. 

**MediaTrust AI** is an enterprise-grade digital forensics and multimedia authenticity verification application that combines multi-spectrum forensic analysis, deep learning computer vision, digital provenance verification, perceptual hashing, compression impact estimation, authorized social stream monitoring, and explainable multi-module evidence fusion.

### Core Distinguishing Principles:
1. **Epistemic Non-Binary Classification:** The system rejects naive "Real vs. Fake" binary labels. Instead, it evaluates multiple orthogonal forensic indicators, calculates calibrated probabilities, and outputs one of five standardized forensic categories with explicit uncertainty bounds and human-in-the-loop escalation advice:
   - *Likely Authentic*
   - *Potentially AI-Generated*
   - *Potentially Manipulated*
   - *Previously Circulated / Similar Media Found*
   - *Requires Further Verification*
2. **Metadata Neutrality:** Stripped EXIF metadata or absent C2PA manifests are treated as signs of privacy sanitation or social platform compression, **never** as automatic proof of malicious fabrication.
3. **Reference-Bounded Matching:** Recycled media detection explicitly scopes its searches to cataloged reference collections, preventing misleading claims of indexing the entire internet.

---

## 2. 3-Member Team Allocation & Architecture

The system is architected around clear modular boundaries aligned with the 3 team member roles:

```
+--------------------------------------------------------------------------------------------------+
|                                    MediaTrust AI Architecture                                    |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|  [ MEMBER 1: AI/ML & Computer Vision Lead ]                                                      |
|  ├── Module A (Pixel Forensics): RGB Histograms, Laplacian Edges, Shannon Entropy, ELA, 2D-FFT   |
|  ├── Module A (Synthetic Image Detector): PyTorch CNN (ForensicSyntheticDetectorCNN)            |
|  └── Module B (Deepfake Video Detector): Face Localization + ForensicDeepfakeFaceCNN + Jitter    |
|                                                                                                  |
|  [ MEMBER 2: Digital Forensics & Provenance Lead ]                                               |
|  ├── Module C (Metadata Analysis): EXIF, Camera Make/Model, GPS, Codecs, Privacy Stripping Check |
|  ├── Module D (C2PA Verification): JUMBF Manifest Scanner, Signature Audit, Provenance History   |
|  ├── Module E (Recycled Media): Multi-Perceptual Hashing (pHash, dHash, aHash, Hamming Distance) |
|  └── Module F (Compression Forensics): Quantization Matrices, Q-Factor, 4:2:0 Subsampling Impact |
|                                                                                                  |
|  [ MEMBER 3: Full-Stack Integration & Monitoring Lead ]                                          |
|  ├── REST Gateway: FastAPI Asynchronous Endpoints, Pydantic v2 Contracts, File Safety Storage   |
|  ├── Module G (Evidence Fusion Engine): Multimodal Bayesian Weighted Synthesis & Reports        |
|  ├── Module H (Security Alerts): Severity Triage, Anomaly Classification & Analyst Workflow      |
|  ├── Module 4 (Social Media Monitor): Reddit OAuth 2.0 & X/Twitter Permitted Stream Connectors   |
|  └── React Frontend: Dark Cybersecurity Dashboard (11 Forensic Workspaces)                       |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

---

## 3. Technology Stack

- **Frontend:** React 19, JavaScript (ES2024), Vite, Recharts, Lucide-React, Tailwind CSS custom dark palette (`#070B19`, `#0D1630`, `#00F0FF`, `#3A86FF`).
- **Backend:** Python 3.13, FastAPI 0.115, Uvicorn, Pydantic v2.
- **Deep Learning & Computer Vision:** PyTorch 2.15, Torchvision, OpenCV 4.10, NumPy, SciPy, Pillow 11.0.
- **Digital Forensics:** ExifTool, C2PA JUMBF Manifest Parser, Perceptual Multi-Hashing (`imagehash`), JPEG Quantization Matrix Analyzer.
- **Database & Storage:** MySQL 8.0 schema (12 tables with foreign keys and indexes) + Local JSON Fallback Persistence for offline zero-config demonstration.
- **Quality Assurance:** Pytest (25 test cases passing 100%), HTTPX TestClient.

---

## 4. Complete Module Breakdown

### Module A: AI-Generated Image & Pixel Forensics
- **Pixel Forensics:**
  - 256-bin RGB color distribution, skewness, and channel standard deviations.
  - Laplacian variance and Sobel gradient density for high-frequency edge transition auditing.
  - Local patch variance and Shannon entropy for texture consistency checks.
  - High-frequency residual noise filtering (median subtraction) and Signal-to-Noise Ratio (SNR).
  - Error Level Analysis (ELA) with 90% quality resave divergence mapping.
  - 2D Fast Fourier Transform (FFT) radial power spectrum calculation to detect synthetic checkerboard lattice artifacts.
- **Synthetic Image Detector (`ForensicSyntheticDetectorCNN`):**
  - Custom deep CNN trained to isolate generative upsampling patterns and GAN/diffusion spectral fingerprints.
  - Calibrated probability output, confidence interval, and explainable feature attributions.

### Module B: Deepfake Video Forensics
- Configurable temporal frame sampling (0.5 fps to 2.0 fps) with max frame budget controls.
- Facial landmark and bounding box localization using Haar Cascades.
- Deepfake face inference via `ForensicDeepfakeFaceCNN`.
- Spatial boundary seam discontinuity analysis (detecting blending artifacts around face-swapped margins).
- Temporal landmark jitter calculation across sequential frames.
- Frame thumbnail generation with timestamps and frame-level anomaly flags.

### Module C: Metadata Analysis
- Extraction of EXIF tags: camera make/model, ISO, exposure, aperture, lens profile.
- Creation and modification timestamps, GPS location coordinates (lat/long/alt).
- Video stream inspection: container format, video codec (H.264, HEVC, VP9), duration, bitrate, frame rate.
- Privacy stripping heuristics distinguishing deliberate metadata sanitization from editing tool signatures.

### Module D: C2PA Digital Provenance
- Binary scan for JUMBF (JPEG Universal Metadata Box Format) manifests and `c2pa` assertion blocks.
- Cryptographic signature status check: Valid, Invalid, Expired, or Unavailable.
- Issuer identity and digital certificate chain verification.
- Audit trail reconstruction showing actions (`c2pa.created`, `c2pa.edited`, `c2pa.filtered`).

### Module E: Recycled Media & Perceptual Hashing
- Computes 64-bit perceptual hashes:
  - `pHash` (DCT-based frequency hash)
  - `dHash` (Gradient difference hash)
  - `aHash` (Average luminance hash)
- Calculates bitwise Hamming distance against the persistent reference catalog (`reference_catalog.json`).
- Matches media with similarity percentages and provenance origin context.

### Module F: Social Media Compression Forensics
- Extracts JPEG quantization tables for luminance and chrominance.
- Estimates original vs. current Q-Factor (1-100 scale).
- Detects 4:2:0 chroma subsampling and macroblock boundary quantization.
- Generates a **Compression Reliability Impact Score** indicating how severely compression noise degrades deep learning confidence.

### Module G: Multi-Module Evidence Fusion Engine
- Ingests telemetry from all 6 forensic channels (Synthetic AI score, Deepfake face score, Pixel anomaly flags, Metadata status, C2PA validity, Recycled match distance).
- Computes Bayesian-weighted overall assessment into the 5 standard categories.
- Outputs human-readable forensic evidence bullet points, epistemic limitations, and explicit verification guidance.

### Module H: Incident Alerts & Notification System
- Automatically registers high/critical anomalies as security alerts in the alert repository.
- Severity levels: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- Full analyst triage lifecycle: unacknowledged alert counters, review notes, and resolution marking.

### Module 4: Authorized Social Media Monitoring
- Official platform connectors for Reddit (OAuth 2.0) and X/Twitter API v2.
- Respects platform terms of service, robots.txt, and rate limits.
- Configurable source accounts and hashtag/keyword discovery filters.
- Automatic deduplication using platform post IDs and media hashes to prevent redundant processing.
- Ingestion feed delivering suspicious posts directly to the verification pipeline.

---

## 5. Frontend User Interface (11 Forensic Workspaces)

The frontend is a dedicated cybersecurity operations center with 11 pages:
1. **Main Dashboard:** Live threat telemetry, 4 KPI metric cards, threat distribution pie chart, weekly verification bar chart, recent alerts, and stream activity.
2. **Image Verification:** Drag-and-drop AI image verification with real-time PyTorch CNN inference, confidence meters, and explainable forensic bullet points.
3. **Video Verification:** Deepfake video forensics displaying sampled frame galleries, face localization crops, boundary seam flags, and temporal jitter graphs.
4. **Pixel Analysis:** Interactive RGB color histograms, Laplacian edge maps, texture entropy, ELA divergence, and 2D-FFT radial power spectrum ratios.
5. **Metadata Analysis:** EXIF camera parameters, GPS coordinates, editing software fingerprints, and privacy stripping audit notices.
6. **C2PA Verification:** Content Credentials manifest tree, signature validation badges, and immutable provenance action history.
7. **Recycled Media:** Multi-hash fingerprinting (`pHash`, `dHash`, `aHash`), reference catalog comparisons, and visual similarity percentage meters.
8. **Social Media Monitoring:** Active stream status, tracked keywords/hashtags, monitored accounts, and discovered media feed with live polling controls.
9. **Alerts & Logs:** Incident response queue with severity filtering, unread badge counter, and analyst acknowledgment actions.
10. **Verification Reports:** Comprehensive multimodal evidence fusion dossiers linking all forensic indicators into an audit-ready PDF/print report.
11. **Settings & Team:** System parameters, model sampling rates, database connection telemetry, and 3-member team role allocations.

---

## 6. Project Directory Structure

```
d:\MediaTrust\
├── backend\
│   ├── app\
│   │   ├── main.py                               # FastAPI application entry point
│   │   ├── core\
│   │   │   ├── config.py                         # Settings, storage paths, limits
│   │   │   ├── media_store.py                    # Media metadata tracking registry
│   │   │   └── security.py                       # File sanitization & SHA-256 digests
│   │   ├── services\
│   │   │   ├── member1_ai_vision\
│   │   │   │   ├── pixel_forensics.py            # OpenCV/NumPy pixel forensics engine
│   │   │   │   ├── ai_image_detector.py          # PyTorch ForensicSyntheticDetectorCNN
│   │   │   │   └── deepfake_detector.py          # Haar Cascade + ForensicDeepfakeFaceCNN
│   │   │   ├── member2_forensics\
│   │   │   │   ├── metadata_extractor.py         # EXIF, GPS & video stream parser
│   │   │   │   ├── c2pa_verifier.py              # C2PA JUMBF manifest & signature scanner
│   │   │   │   ├── perceptual_hasher.py          # pHash, dHash, aHash multi-hasher
│   │   │   │   └── compression_analyzer.py       # JPEG quantization & Q-factor analyzer
│   │   │   └── member3_integration\
│   │   │       ├── evidence_fusion.py            # Multimodal Bayesian evidence fusion engine
│   │   │       ├── alert_service.py              # Alert lifecycle & incident management
│   │   │       └── social_monitor.py             # Authorized Reddit & X stream connectors
│   │   ├── schemas\
│   │   │   ├── media_schema.py                   # Upload schemas
│   │   │   ├── analysis_schema.py                # Pixel analysis schemas
│   │   │   ├── ai_image_schema.py                # Synthetic image detector schemas
│   │   │   ├── video_schema.py                   # Deepfake & frame forensics schemas
│   │   │   ├── forensics_schema.py               # Metadata & C2PA schemas
│   │   │   ├── recycled_compression_schema.py    # Perceptual hash & compression schemas
│   │   │   ├── report_alert_schema.py            # Fusion reports & alert schemas
│   │   │   └── monitoring_schema.py              # Social media monitoring schemas
│   │   └── api\v1\
│   │       ├── api_router.py                     # Central v1 REST router
│   │       ├── endpoints_media.py                # File ingestion endpoints
│   │       ├── endpoints_image.py                # Pixel analysis endpoints
│   │       ├── endpoints_ai_image.py             # PyTorch synthetic image endpoints
│   │       ├── endpoints_video.py                # Video deepfake endpoints
│   │       ├── endpoints_forensics.py            # Metadata & C2PA endpoints
│   │       ├── endpoints_recycled_compression.py # Recycled media & compression endpoints
│   │       ├── endpoints_reports_alerts.py       # Fusion reports & alert endpoints
│   │       └── endpoints_monitoring.py           # Social media stream endpoints
│   ├── storage\
│   │   ├── uploads\                              # Uploaded multimedia files
│   │   ├── frames\                               # Extracted video frame thumbnails
│   │   └── reports\                              # Generated audit reports
│   ├── tests\
│   │   ├── conftest.py                           # Pytest environment configuration
│   │   ├── test_pixel_analysis.py                # Pixel forensics tests (6 tests)
│   │   ├── test_ai_image_detector.py             # PyTorch CNN tests (4 tests)
│   │   ├── test_video_deepfake.py                # Deepfake video tests (2 tests)
│   │   ├── test_metadata_c2pa.py                 # Metadata & C2PA tests (4 tests)
│   │   ├── test_recycled_compression.py          # Perceptual hash & compression tests (3 tests)
│   │   ├── test_evidence_fusion_alerts.py        # Fusion & alert tests (2 tests)
│   │   └── test_social_monitoring.py             # Social monitoring tests (4 tests)
│   └── requirements.txt
├── frontend\
│   ├── src\
│   │   ├── assets\                               # Icons & branding assets
│   │   ├── components\
│   │   │   ├── common\
│   │   │   │   ├── StatusBadge.jsx               # Standard forensic status badge
│   │   │   │   ├── MetricCard.jsx                # Telemetry KPI cards
│   │   │   │   ├── FileUploadZone.jsx            # Drag-and-drop secure file uploader
│   │   │   │   └── UncertaintyNotice.jsx         # Epistemic limitation notice
│   │   │   └── layout\
│   │   │       ├── Sidebar.jsx                   # Dark navy navigation sidebar
│   │   │       └── Topbar.jsx                    # System status and alert bell header
│   │   ├── pages\
│   │   │   ├── DashboardPage.jsx                 # Page 1: Main Dashboard
│   │   │   ├── ImageVerificationPage.jsx         # Page 2: AI Image Verification
│   │   │   ├── VideoVerificationPage.jsx         # Page 3: Video Deepfake Verification
│   │   │   ├── PixelAnalysisPage.jsx             # Page 4: Pixel Forensics
│   │   │   ├── MetadataAnalysisPage.jsx          # Page 5: Metadata Forensics
│   │   │   ├── C2PAPage.jsx                      # Page 6: C2PA Credentials
│   │   │   ├── RecycledMediaPage.jsx             # Page 7: Recycled Media Index
│   │   │   ├── SocialMonitoringPage.jsx          # Page 8: Social Monitoring
│   │   │   ├── AlertsPage.jsx                    # Page 9: Alerts & Triage
│   │   │   ├── VerificationReportsPage.jsx       # Page 10: Multimodal Reports
│   │   │   └── SettingsPage.jsx                  # Page 11: Settings & Team Architecture
│   │   ├── services\
│   │   │   └── api.js                            # Axios API client
│   │   ├── App.jsx                               # Root application component
│   │   ├── index.css                             # Dark cybersecurity design system
│   │   └── main.jsx                              # Vite entry point
│   ├── package.json
│   └── vite.config.js
├── database\
│   └── schema.sql                                # Complete 12-table MySQL 8.0 schema
├── venv\                                         # Python virtual environment (PyTorch 2.15)
└── README.md
```

---

## 7. Installation & Quick Start Guide

### Step 1: Run Automated Backend Tests
Verify all 25 test suites pass with zero regressions:
```powershell
cd d:\MediaTrust
python -m pytest backend/tests -v
```
*(Result: 25 passed in ~10 seconds)*

### Step 2: Start the FastAPI Backend Server
```powershell
cd d:\MediaTrust\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base URL: `http://127.0.0.1:8000`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc Documentation: `http://127.0.0.1:8000/redoc`

### Step 3: Start the React Frontend Dashboard
In a separate terminal:
```powershell
cd d:\MediaTrust\frontend
npm run dev
```
- Dashboard URL: `http://localhost:5173`

---

## 8. Live Demonstration Script for College Presentation

When presenting the project to examiners and faculty:

1. **Architecture & Team Walkthrough (Page 11 - Settings):**
   - Open `Settings` to showcase the 3-member division of responsibilities (Member 1: Vision/AI, Member 2: Digital Forensics/Provenance, Member 3: Full-Stack Integration/Monitoring).
   - Point out the active status of the MySQL schema and the fallback local persistence mechanism.
2. **Main Dashboard Telemetry (Page 1):**
   - Walk through the real-time KPIs: Total Media Analyzed, Images, Videos, and Potentially Suspicious Media flags.
   - Highlight the threat distribution chart representing the 5 non-binary forensic categories.
3. **AI-Generated Image Analysis (Page 2 & Page 4):**
   - Upload a sample image on the `Image Verification` page.
   - Observe the live PyTorch CNN inference, probability confidence score, and explainable feature attributions.
   - Navigate to `Pixel Analysis` to inspect the underlying physical evidence: RGB histograms, Laplacian edge density, Shannon entropy, ELA divergence, and 2D-FFT radial energy ratio.
4. **Deepfake Video Analysis (Page 3):**
   - Upload a test video on `Video Verification`.
   - Point out frame sampling (1 fps), automated facial localization, deepfake CNN classification, spatial seam boundary checks, and temporal landmark jitter graphs.
5. **Digital Provenance & Recycled Media (Pages 5, 6 & 7):**
   - Demonstrate `Metadata Analysis` showing camera make/model and privacy stripping audits.
   - Demonstrate `C2PA Verification` displaying JUMBF assertion trees and digital signature states.
   - Demonstrate `Recycled Media` showcasing perceptual hashes (`pHash`, `dHash`, `aHash`) and Hamming distance matching against the reference collection.
6. **Social Media Stream Monitoring (Page 8):**
   - Demonstrate authorized stream polling from Reddit / X.
   - Add a keyword or hashtag and trigger "Poll Stream" to watch eligible media get discovered and sent to the verification pipeline.
7. **Evidence Fusion & Multimodal Reports (Pages 9 & 10):**
   - Review an incident alert on `Alerts & Logs`, view severity rating, and submit analyst review notes.
   - Open `Verification Reports` to review the synthesized multi-channel dossier demonstrating how all forensic signals combine into an explainable, defensible assessment.

---

## 9. Academic Defense & Rigor Highlights

- **No Fake Random Scores:** All metrics are derived from real mathematical algorithms (Fast Fourier Transform, Error Level Analysis, Laplacian variance) and trained PyTorch neural networks.
- **Robustness Against Adversarial Countermeasures:** Multimodal fusion ensures that even if an adversary strips metadata or applies heavy social media compression, pixel-level artifacts and perceptual hashes still detect anomalies.
- **Ethical and Legal Compliance:** Social media monitoring strictly adheres to official public APIs (OAuth 2.0), respecting robots.txt and user privacy standards without unauthorized scraping.
