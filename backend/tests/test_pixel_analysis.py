import io
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def generate_synthetic_test_image(format: str = "JPEG", size: tuple[int, int] = (256, 256)) -> io.BytesIO:
    """Generate a reproducible multi-color synthetic test image with edges and noise."""
    img = Image.new("RGB", size, color=(128, 128, 128))
    draw = ImageDraw.Draw(img)

    # Draw colored geometric patterns to create high-frequency edges and distinct channel statistics
    draw.rectangle([20, 20, 100, 100], fill=(220, 40, 40), outline=(255, 255, 255))
    draw.ellipse([120, 40, 220, 140], fill=(40, 200, 80), outline=(0, 0, 0))
    draw.polygon([(50, 150), (120, 240), (20, 240)], fill=(40, 80, 230))
    draw.line([(0, 0), (255, 255)], fill=(255, 255, 0), width=3)

    buf = io.BytesIO()
    img.save(buf, format=format)
    buf.seek(0)
    return buf


def test_health_check():
    """Verify system health endpoint and capability flags."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Phase 1" in data["active_phase"]
    assert data["capabilities"]["image_upload"] is True
    assert data["capabilities"]["rgb_histograms"] is True
    assert data["capabilities"]["edge_density_laplacian"] is True
    assert data["capabilities"]["fft_frequency_spectrum"] is True


def test_root_endpoint():
    """Verify API root endpoint metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "MediaTrust AI"
    assert data["documentation"] == "/docs"


def test_reject_unsupported_file_extension():
    """Verify rejection of non-image and non-video media types with HTTP 415."""
    fake_txt = io.BytesIO(b"This is a text file, not an image.")
    response = client.post(
        "/api/v1/media/upload",
        files={"file": ("malicious.txt", fake_txt, "text/plain")},
    )
    assert response.status_code == 415
    assert "Unsupported format" in response.json()["detail"]


def test_reject_empty_file():
    """Verify rejection of 0-byte file uploads with HTTP 400."""
    empty_buf = io.BytesIO(b"")
    response = client.post(
        "/api/v1/media/upload",
        files={"file": ("empty.jpg", empty_buf, "image/jpeg")},
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_image_upload_and_pixel_analysis_flow():
    """Verify the full 2-step pipeline: Upload image, then run pixel forensics."""
    img_buf = generate_synthetic_test_image("JPEG")
    upload_res = client.post(
        "/api/v1/media/upload",
        files={"file": ("test_sample.jpg", img_buf, "image/jpeg")},
    )
    assert upload_res.status_code == 201
    upload_data = upload_res.json()

    media_id = upload_data["media_id"]
    assert media_id is not None
    assert upload_data["media_type"] == "image"
    assert upload_data["file_format"] == "JPEG"
    assert len(upload_data["sha256_hash"]) == 64

    # Step 2: Trigger Pixel Analysis
    analysis_res = client.post(f"/api/v1/analysis/pixel/{media_id}")
    assert analysis_res.status_code == 200
    analysis = analysis_res.json()

    assert analysis["media_id"] == media_id
    assert analysis["filename"] == "test_sample.jpg"

    # Dimensions
    dim = analysis["dimensions"]
    assert dim["width"] == 256
    assert dim["height"] == 256
    assert dim["channels"] == 3

    # Channel Statistics
    stats = analysis["channel_statistics"]
    for ch in ("red", "green", "blue"):
        assert ch in stats
        assert 0 <= stats[ch]["mean"] <= 255
        assert stats[ch]["std_dev"] >= 0
        assert "skewness" in stats[ch]

    # Histograms
    hists = analysis["histograms"]
    assert len(hists["r"]) == 256
    assert len(hists["g"]) == 256
    assert len(hists["b"]) == 256
    assert sum(hists["r"]) == dim["total_pixels"]

    # Edge analysis
    edges = analysis["edge_analysis"]
    assert edges["laplacian_variance"] > 0
    assert 0 <= edges["edge_density"] <= 1.0
    assert edges["sobel_gradient_mean"] > 0

    # Texture analysis
    texture = analysis["texture_analysis"]
    assert texture["texture_score"] >= 0
    assert texture["shannon_entropy"] > 0

    # Noise analysis
    noise = analysis["noise_analysis"]
    assert noise["noise_variance"] >= 0
    assert "snr_db" in noise

    # Error Level Analysis (ELA)
    ela = analysis["error_level_analysis"]
    assert ela["ela_quality_tested"] == 90
    assert ela["ela_mean_divergence"] >= 0
    assert ela["divergence_uniformity_score"] > 0

    # 2D-FFT Frequency Analysis
    fft = analysis["frequency_analysis"]
    assert fft["fft_total_energy"] > 0
    assert 0 <= fft["high_frequency_ratio"] <= 1.0
    assert 0 <= fft["low_frequency_ratio"] <= 1.0

    # Scientific explainability notes
    assert len(analysis["scientific_notes"]) >= 3


def test_convenience_upload_and_analyze_pixel():
    """Verify single-call upload-and-analyze endpoint."""
    img_buf = generate_synthetic_test_image("PNG")
    response = client.post(
        "/api/v1/analysis/pixel-upload",
        files={"file": ("direct_test.png", img_buf, "image/png")},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["dimensions"]["width"] == 256
    assert data["error_level_analysis"]["ela_quality_tested"] == 90
    assert data["edge_analysis"]["laplacian_variance"] > 0
