from pathlib import Path
from typing import Optional
from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status

from app.core.config import settings
from app.core.media_store import get_media_record, save_media_record, update_media_analysis
from app.core.security import compute_sha256, generate_storage_filename
from app.schemas.video_schema import FrameAnalysisResult, VideoAnalysisResponse
from app.services.member1_ai_vision.deepfake_detector import DeepfakeDetectionService

router = APIRouter(prefix="/analysis", tags=["Video & Deepfake Analysis"])

_deepfake_service: Optional[DeepfakeDetectionService] = None


def get_deepfake_service() -> DeepfakeDetectionService:
    global _deepfake_service
    if _deepfake_service is None:
        _deepfake_service = DeepfakeDetectionService()
    return _deepfake_service


@router.post("/video/{media_id}", response_model=VideoAnalysisResponse)
def analyze_video_deepfake(
    media_id: str,
    sample_interval_sec: float = Query(0.5, ge=0.1, le=5.0, description="Sampling interval in seconds"),
    max_samples: int = Query(30, ge=5, le=100, description="Maximum number of frames to sample"),
) -> VideoAnalysisResponse:
    """Extract frames from uploaded video, perform face localization, boundary checking, and deepfake inference."""
    record = get_media_record(media_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Media '{media_id}' not found.")

    if record["media_type"] != "video":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Video analysis applies only to videos; media is '{record['media_type']}'.",
        )

    storage_path = Path(record["storage_path"])
    if not storage_path.exists():
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Video file missing from storage.")

    try:
        service = get_deepfake_service()
        analysis = service.analyze_video(
            video_path=storage_path,
            media_id=media_id,
            sample_interval_sec=sample_interval_sec,
            max_samples=max_samples,
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Video processing failed: {exc}") from exc

    update_media_analysis(media_id, "video_analysis", analysis)
    return VideoAnalysisResponse(**analysis)


@router.get("/video/{media_id}/frames", response_model=list[FrameAnalysisResult])
def get_video_frames(media_id: str) -> list[FrameAnalysisResult]:
    """Retrieve frame-level metadata and deepfake scores for an analyzed video."""
    record = get_media_record(media_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Media '{media_id}' not found.")

    vid_analysis = record.get("video_analysis")
    if not vid_analysis or "sampled_frames" not in vid_analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video has not been analyzed yet. Please run POST /api/v1/analysis/video/{media_id} first.",
        )

    return [FrameAnalysisResult(**f) for f in vid_analysis["sampled_frames"]]


@router.post("/video-upload", response_model=VideoAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def upload_and_analyze_video(
    file: UploadFile = File(...),
    sample_interval_sec: float = Query(0.5, ge=0.1, le=5.0),
    max_samples: int = Query(20, ge=5, le=50),
) -> VideoAnalysisResponse:
    """Direct video upload and immediate frame-level deepfake inference."""
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file provided.")

    file_ext = Path(file.filename).suffix.lower().lstrip(".")
    if file_ext not in settings.ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported video format '{file_ext}'. Allowed: {sorted(settings.ALLOWED_VIDEO_EXTENSIONS)}",
        )

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    if len(file_bytes) > settings.MAX_VIDEO_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Video exceeds maximum size limit of {settings.MAX_VIDEO_SIZE_BYTES / (1024 * 1024):.0f} MB.",
        )

    import uuid

    media_id = str(uuid.uuid4())
    safe_filename = generate_storage_filename(file.filename)
    target_path = settings.UPLOAD_DIR / safe_filename
    target_path.write_bytes(file_bytes)

    save_media_record(
        media_id=media_id,
        original_filename=file.filename,
        storage_path=str(target_path),
        media_type="video",
        file_format=file_ext.upper(),
        file_size_bytes=len(file_bytes),
        sha256_hash=compute_sha256(file_bytes),
    )

    try:
        service = get_deepfake_service()
        analysis = service.analyze_video(
            video_path=target_path,
            media_id=media_id,
            sample_interval_sec=sample_interval_sec,
            max_samples=max_samples,
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Video analysis failed: {exc}") from exc

    update_media_analysis(media_id, "video_analysis", analysis)
    return VideoAnalysisResponse(**analysis)
