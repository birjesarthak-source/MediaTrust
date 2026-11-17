import io
from pathlib import Path
from PIL import Image, ImageDraw
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_evidence_fusion_report_generation():
    """Verify end-to-end multi-module evidence fusion and report generation."""
    img = Image.new("RGB", (256, 256), color=(140, 160, 180))
    draw = ImageDraw.Draw(img)
    draw.rectangle([40, 40, 140, 140], fill=(220, 70, 70))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    buf.seek(0)

    upload_res = client.post(
        "/api/v1/media/upload",
        files={"file": ("fusion_test_image.jpg", buf, "image/jpeg")},
    )
    assert upload_res.status_code == 201
    media_id = upload_res.json()["media_id"]

    # Generate fusion report
    report_res = client.post(f"/api/v1/reports/generate/{media_id}")
    assert report_res.status_code == 200
    report = report_res.json()

    assert report["media_id"] == media_id
    assert report["report_id"] is not None

    valid_categories = {
        "Likely Authentic",
        "Potentially AI-Generated",
        "Potentially Manipulated",
        "Previously Circulated / Similar Media Found",
        "Requires Further Verification",
    }
    assert report["overall_assessment"] in valid_categories
    assert 0.0 <= report["confidence_score"] <= 1.0
    assert len(report["key_evidence"]) > 0
    assert "limitations" in report["uncertainty_and_limitations"].lower()
    assert len(report["human_verification_recommendation"]) > 0

    # Query report by ID
    get_res = client.get(f"/api/v1/reports/{report['report_id']}")
    assert get_res.status_code == 200
    assert get_res.json()["report_id"] == report["report_id"]


def test_alert_lifecycle():
    """Verify alert listing and human acknowledgment."""
    # List alerts
    alerts_res = client.get("/api/v1/alerts")
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert isinstance(alerts, list)

    if alerts:
        target_alert = alerts[0]
        alert_id = target_alert["id"]

        # Acknowledge alert
        ack_res = client.patch(
            f"/api/v1/alerts/{alert_id}/acknowledge",
            json={"notes": "Reviewed by lead forensics officer. False alarm verified."},
        )
        assert ack_res.status_code == 200
        updated = ack_res.json()
        assert updated["acknowledged"] is True
        assert updated["acknowledged_at"] is not None
