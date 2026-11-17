import io
from pathlib import Path
from PIL import Image, ImageDraw
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.member2_forensics.compression_analyzer import analyze_compression
from app.services.member2_forensics.perceptual_hasher import (
    compute_all_hashes,
    hamming_distance,
    search_recycled_media,
)

client = TestClient(app)


def test_perceptual_hashes_calculation(tmp_path: Path):
    """Verify pHash, dHash, and aHash generation and identical match distance."""
    img = Image.new("RGB", (256, 256), color=(200, 100, 50))
    draw = ImageDraw.Draw(img)
    draw.rectangle([50, 50, 150, 150], fill=(50, 200, 150))
    test_file = tmp_path / "hash_sample.png"
    img.save(test_file, format="PNG")

    hashes = compute_all_hashes(test_file)
    assert len(hashes["phash"]) == 16
    assert len(hashes["dhash"]) == 16
    assert len(hashes["ahash"]) == 16

    # Distance to itself must be 0
    assert hamming_distance(hashes["phash"], hashes["phash"]) == 0


def test_compression_analysis_jpeg(tmp_path: Path):
    """Verify compression severity assessment and quality factor estimation."""
    img = Image.new("RGB", (1080, 1080), color=(120, 130, 140))
    test_file = tmp_path / "social_res_sample.jpg"
    img.save(test_file, format="JPEG", quality=75)

    comp = analyze_compression(test_file)
    assert comp["resizing_detected"] is True
    assert comp["compression_severity"] in {"Moderate", "Low", "Severe"}
    assert "reliability" in comp["ai_reliability_impact"].lower()


def test_api_recycled_and_compression_endpoints():
    """Verify HTTP endpoints for recycled media search and compression."""
    img = Image.new("RGB", (200, 200), color=(80, 180, 220))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    upload_res = client.post(
        "/api/v1/media/upload",
        files={"file": ("recycled_check.jpg", buf, "image/jpeg")},
    )
    assert upload_res.status_code == 201
    media_id = upload_res.json()["media_id"]

    # Recycled check
    recycled_res = client.post(f"/api/v1/forensics/recycled/{media_id}")
    assert recycled_res.status_code == 200
    r_data = recycled_res.json()
    assert r_data["media_id"] == media_id
    assert "hashes" in r_data
    assert "reference_database_scope" in r_data

    # Compression check
    comp_res = client.post(f"/api/v1/forensics/compression/{media_id}")
    assert comp_res.status_code == 200
    c_data = comp_res.json()
    assert c_data["media_id"] == media_id
    assert "compression_severity" in c_data
