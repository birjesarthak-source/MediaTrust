from typing import Any, Optional
from pydantic import BaseModel, Field


class SpectralArtifactMetrics(BaseModel):
    fft_peak_count: int = Field(..., description="Detected periodic peak anomalies in frequency spectrum")
    spectral_energy_ratio: float = Field(..., description="High-to-low radial frequency ratio")
    synthetic_grid_detected: bool = Field(..., description="Flag indicating potential upsampling checkerboard grid")


class SpatialResidualMetrics(BaseModel):
    mean_spatial_residual: float = Field(..., description="Mean difference from natural filter response")
    residual_variance: float = Field(..., description="Variance of spatial residual artifacts")


class AIImageDetectionResponse(BaseModel):
    media_id: str
    model_name: str = Field(..., description="Underlying CNN/PyTorch model architecture")
    prediction: str = Field(..., description="'Likely Authentic' or 'Potentially AI-Generated'")
    synthetic_probability: float = Field(..., ge=0.0, le=1.0, description="Model probability that image is synthetic")
    authentic_probability: float = Field(..., ge=0.0, le=1.0, description="Model probability that image is authentic")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Calibrated confidence level")
    inference_latency_ms: float = Field(..., description="Time taken for PyTorch model inference in milliseconds")
    spectral_artifacts: SpectralArtifactMetrics
    spatial_residuals: SpatialResidualMetrics
    explainability: list[str] = Field(..., description="Human-interpretable forensic reasoning")
    uncertainty_and_limitations: str = Field(..., description="Scientific limitations and confidence constraints")
