import io
from pathlib import Path
import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.member1_ai_vision.deepfake_detector import DeepfakeDetectionService

client = TestClient(app)


def create_synthetic_mp4_video(file_path: Path, num_frames: int = 15, fps: float = 10.0) -> None:
    """Generate a valid, compact MP4 test video using OpenCV VideoWriter."""
    width, height = 160, 120
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(str(file_path), fourcc, fps, (width, height))

    for i in range(num_frames):
        # Create animated frame with moving circle
        frame = np.full((height, width, 3), (40 + i * 5, 80, 120), dtype=np.uint8)
        cv2.circle(frame, (20 + i * 8, 60), 15, (255, 255, 255), -1)
        out.write(frame)

    out.release()


def test_video_analysis_no_faces(tmp_path: Path):
    """Verify video analysis pipeline on non-facial video reports Inapplicable correctly."""
    vid_path = tmp_path / "test_motion.mp4"
    create_synthetic_mp4_video(vid_path, num_frames=12, fps=10.0)

    service = DeepfakeDetectionService()
    result = service.analyze_video(vid_path, media_id="test_vid_001", sample_interval_sec=0.2, max_samples=10)

    assert result["media_id"] == "test_vid_001"
    assert result["duration_seconds"] > 0
    assert result["total_frames"] >= 10
    assert result["sampled_frames_count"] > 0
    assert result["video_assessment"] == "Inapplicable: No Human Subjects Detected"
    assert len(result["scientific_evidence_notes"]) >= 3


def test_api_video_upload_and_frames_flow(tmp_path: Path):
    """Verify HTTP upload and frame retrieval flow."""
    vid_path = tmp_path / "api_test.mp4"
    create_synthetic_mp4_video(vid_path, num_frames=10, fps=10.0)

    video_bytes = vid_path.read_bytes()
    upload_res = client.post(
        "/api/v1/media/upload",
        files={"file": ("synthetic_stream.mp4", io.BytesIO(video_bytes), "video/mp4")},
    )
    assert upload_res.status_code == 201
    media_id = upload_res.json()["media_id"]

    # Trigger video deepfake analysis
    analyze_res = client.post(f"/api/v1/analysis/video/{media_id}?sample_interval_sec=0.3&max_samples=5")
    assert analyze_res.status_code == 200
    data = analyze_res.json()
    assert data["media_id"] == media_id
    assert data["sampled_frames_count"] > 0

    # Retrieve frame details
    frames_res = client.get(f"/api/v1/analysis/video/{media_id}/frames")
    assert frames_res.status_code == 200
    frames = frames_res.json()
    assert len(frames) == data["sampled_frames_count"]
    assert "timestamp_seconds" in frames[0]
