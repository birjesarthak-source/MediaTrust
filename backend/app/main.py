import sys
from pathlib import Path

# Ensure venv site-packages is accessible for PyTorch and SciPy
_venv_site = Path("d:/MediaTrust/venv/Lib/site-packages")
if _venv_site.exists() and str(_venv_site) not in sys.path:
    sys.path.insert(0, str(_venv_site))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api_router import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "documentation": "/docs",
        "api_v1": settings.API_V1_STR,
    }


@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": "MediaTrust AI Backend",
        "active_phase": "Phase 1: Image Upload and Pixel Analysis",
        "capabilities": {
            "image_upload": True,
            "channel_statistics": True,
            "rgb_histograms": True,
            "edge_density_laplacian": True,
            "texture_shannon_entropy": True,
            "noise_variance_estimation": True,
            "error_level_analysis_ela": True,
            "fft_frequency_spectrum": True,
        },
    }
