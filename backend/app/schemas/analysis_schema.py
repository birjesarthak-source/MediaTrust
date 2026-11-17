from typing import Any
from pydantic import BaseModel, Field


class ChannelStats(BaseModel):
    mean: float
    std_dev: float
    min: float
    max: float
    median: float
    skewness: float


class EdgeMetrics(BaseModel):
    laplacian_variance: float
    edge_density: float
    sobel_gradient_mean: float
    sobel_gradient_max: float


class TextureMetrics(BaseModel):
    texture_score: float
    texture_variance: float
    shannon_entropy: float


class NoiseMetrics(BaseModel):
    noise_variance: float
    noise_mean: float
    snr_db: float


class ELAMetrics(BaseModel):
    ela_quality_tested: int
    ela_mean_divergence: float
    ela_max_divergence: float
    ela_std_divergence: float
    divergence_uniformity_score: float


class FrequencyMetrics(BaseModel):
    fft_total_energy: float
    high_frequency_ratio: float
    low_frequency_ratio: float
    high_to_low_energy_ratio: float


class ImageDimensions(BaseModel):
    width: int
    height: int
    channels: int
    aspect_ratio: float
    total_pixels: int


class PixelAnalysisResponse(BaseModel):
    media_id: str
    filename: str
    dimensions: ImageDimensions
    channel_statistics: dict[str, ChannelStats]
    histograms: dict[str, list[int]] = Field(..., description="256-bin RGB color distributions")
    edge_analysis: EdgeMetrics
    texture_analysis: TextureMetrics
    noise_analysis: NoiseMetrics
    error_level_analysis: ELAMetrics
    frequency_analysis: FrequencyMetrics
    scientific_notes: list[str]
