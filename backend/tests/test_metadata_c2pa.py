import io
from pathlib import Path
from PIL import Image, ImageDraw
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.member2_forensics.c2pa_verifier import verify_c2pa
from app.services.member2_forensics.metadata_extractor import extract_image_metadata

client = TestClient(app)


def test_image_metadata_extraction(tmp_path: Path):
    """Verify EXIF and basic image metadata parsing."""
    img = Image.new("RGB", (320, 240), color=(70, 90, 110))
    test_file = tmp_path / "meta_test.jpg"
    img.save(test_file, format="JPEG")

    meta = extract_image_metadata(test_file)
    assert meta["format"] == "JPEG"
    assert meta["dimensions"]["width"] == 320
    assert meta["dimensions"]["height"] == 240
    assert meta["metadata_stripped"] is True  # newly generated synthetic image has no hardware EXIF


def test_c2pa_unavailable(tmp_path: Path):
    """Verify handling when no C2PA Content Credentials are embedded."""
    img = Image.new("RGB", (100, 100), color=(255, 0, 0))
    test_file = tmp_path / "plain_photo.png"
    img.save(test_file, format="PNG")

    c2pa = verify_c2pa(test_file)
    assert c2pa["manifest_present"] is False
    assert c2pa["validation_status"] == "Unavailable"
    assert "no c2pa" in c2pa["c2pa_summary"].lower() or "not contain" in c2pa["c2pa_summary"].lower()


def test_c2pa_manifest_detected(tmp_path: Path):
    """Verify detection when C2PA byte markers and Adobe credentials are present."""
    test_file = tmp_path / "c2pa_signed_sample.jpg"
    # Construct binary file containing C2PA markers and Adobe claim generator signature
    test_file.write_bytes(
        b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00"
        b"\xFF\xEB\x00\x40c2paurn:c2pa:claim:Adobe Creative Cloud C2PA Subsystem c2pa.created\x00"
        b"\xFF\xD9"
    )

    c2pa = verify_c2pa(test_file)
    assert c2pa["manifest_present"] is True
    assert c2pa["validation_status"] == "Valid"
    assert "Adobe" in c2pa["claim_generator"]
    assert any(a["action"] == "c2pa.created" for a in c2pa["assertion_actions"])


def test_api_metadata_and_c2pa_flow():
    """Verify HTTP endpoints for metadata and C2PA."""
    img = Image.new("RGB", (200, 200), color=(50, 150, 250))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    upload_res = client.post(
        "/api/v1/media/upload",
        files={"file": ("meta_c2pa_flow.jpg", buf, "image/jpeg")},
    )
    assert upload_res.status_code == 201
    media_id = upload_res.json()["media_id"]

    # Metadata endpoint
    meta_res = client.post(f"/api/v1/forensics/metadata/{media_id}")
    assert meta_res.status_code == 200
    meta_data = meta_res.json()
    assert meta_data["media_id"] == media_id
    assert meta_data["image_metadata"]["dimensions"]["width"] == 200

    # C2PA endpoint
    c2pa_res = client.post(f"/api/v1/forensics/c2pa/{media_id}")
    assert c2pa_res.status_code == 200
    c2pa_data = c2pa_res.json()
    assert c2pa_data["media_id"] == media_id
    assert c2pa_data["validation_status"] in {"Valid", "Unavailable"}
    assert "epistemic_disclaimer" in c2pa_data
