import io
from pathlib import Path
from PIL import Image, ImageDraw
import pytest
import torch
from fastapi.testclient import TestClient

from app.main import app
from app.services.member1_ai_vision.ai_image_detector import (
    AIImageDetectorService,
    ForensicSyntheticDetectorCNN,
)

client = TestClient(app)


def generate_sample_image(format: str = "PNG", size: tuple[int, int] = (256, 256)) -> io.BytesIO:
    """Generate a clean test image with natural gradients and geometric shapes."""
    img = Image.new("RGB", size, color=(100, 150, 200))
    draw = ImageDraw.Draw(img)
    draw.rectangle([30, 30, 120, 120], fill=(220, 50, 50), outline=(255, 255, 255))
    draw.ellipse([100, 100, 200, 200], fill=(50, 200, 100), outline=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format=format)
    buf.seek(0)
    return buf


def test_pytorch_cnn_architecture_forward():
    """Verify PyTorch ForensicSyntheticDetectorCNN model initializes and executes forward pass."""
    model = ForensicSyntheticDetectorCNN(num_classes=2)
    model.eval()

    dummy_input = torch.randn(2, 3, 224, 224)
    with torch.no_grad():
        logits = model(dummy_input)

    assert logits.shape == (2, 2)
    assert not torch.isnan(logits).any()
    assert not torch.isinf(logits).any()


def test_detector_service_inference(tmp_path: Path):
    """Verify AIImageDetectorService executes prediction on a saved image with true probabilities."""
    img_buf = generate_sample_image("JPEG")
    test_file = tmp_path / "sample_test.jpg"
    test_file.write_bytes(img_buf.getvalue())

    service = AIImageDetectorService()
    result = service.predict(test_file)

    assert result["model_name"] == "ForensicResNet-SyntheticDetector-v1"
    assert result["prediction"] in {"Likely Authentic", "Potentially AI-Generated"}
    assert 0.0 <= result["synthetic_probability"] <= 1.0
    assert 0.0 <= result["authentic_probability"] <= 1.0
    assert result["synthetic_probability"] + result["authentic_probability"] == pytest.approx(1.0, abs=1e-3)
    assert 0.0 <= result["confidence_score"] <= 1.0
    assert result["inference_latency_ms"] > 0

    # Spectral metrics
    spec = result["spectral_artifacts"]
    assert spec["fft_peak_count"] >= 0
    assert isinstance(spec["synthetic_grid_detected"], bool)

    # Spatial residuals
    spatial = result["spatial_residuals"]
    assert spatial["mean_spatial_residual"] >= 0.0
    assert spatial["residual_variance"] >= 0.0

    # Explainability
    assert len(result["explainability"]) >= 3
    assert "limitations" in result["uncertainty_and_limitations"].lower()


def test_api_ai_image_endpoint():
    """Verify /api/v1/analysis/ai-image/{media_id} endpoint."""
    img_buf = generate_sample_image("JPEG")
    upload_res = client.post(
        "/api/v1/media/upload",
        files={"file": ("synth_check.jpg", img_buf, "image/jpeg")},
    )
    assert upload_res.status_code == 201
    media_id = upload_res.json()["media_id"]

    detect_res = client.post(f"/api/v1/analysis/ai-image/{media_id}")
    assert detect_res.status_code == 200
    data = detect_res.json()

    assert data["media_id"] == media_id
    assert data["prediction"] in {"Likely Authentic", "Potentially AI-Generated"}
    assert 0.0 <= data["synthetic_probability"] <= 1.0
    assert 0.0 <= data["authentic_probability"] <= 1.0
    assert len(data["explainability"]) > 0


def test_convenience_ai_image_upload_endpoint():
    """Verify /api/v1/analysis/ai-image-upload direct upload and inference."""
    img_buf = generate_sample_image("PNG")
    response = client.post(
        "/api/v1/analysis/ai-image-upload",
        files={"file": ("direct_ai.png", img_buf, "image/png")},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["media_id"] is not None
    assert data["model_name"] == "ForensicResNet-SyntheticDetector-v1"
    assert "spectral_artifacts" in data
    assert "spatial_residuals" in data
