from pathlib import Path
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.config import settings
from app.core.media_store import get_media_record, save_media_record, update_media_analysis
from app.core.security import compute_sha256, generate_storage_filename
from app.schemas.ai_image_schema import AIImageDetectionResponse
from app.services.member1_ai_vision.ai_image_detector import AIImageDetectorService

router = APIRouter(prefix="/analysis", tags=["AI Image Detection"])

# Shared detector service instance
_detector_service: AIImageDetectorService | None = None


def get_detector() -> AIImageDetectorService:
    global _detector_service
    if _detector_service is None:
        _detector_service = AIImageDetectorService()
    return _detector_service


@router.post("/ai-image/{media_id}", response_model=AIImageDetectionResponse)
def analyze_ai_image(media_id: str) -> AIImageDetectionResponse:
    """Execute PyTorch deep-learning AI-generated image detection on registered media.

    Computes:
    - PyTorch CNN forward inference logits and continuous softmax probabilities
    - 2D-FFT high-frequency spectral grid peak detection (GAN / Diffusion upsampling artifacts)
    - Spatial residual variance analysis
    - Continuous confidence scoring with explicit uncertainty bounds
    """
    record = get_media_record(media_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Media '{media_id}' not found.")

    if record["media_type"] != "image":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"AI image detection applies only to images; media is '{record['media_type']}'.",
        )

    storage_path = Path(record["storage_path"])
    if not storage_path.exists():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Media file is missing from local storage.",
        )

    try:
        detector = get_detector()
        result = detector.predict(storage_path)
        result["media_id"] = media_id
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI model inference failed: {str(exc)}",
        ) from exc

    # Persist in media store
    update_media_analysis(media_id, "ai_analysis", result)

    return AIImageDetectionResponse(**result)


@router.post("/ai-image-upload", response_model=AIImageDetectionResponse, status_code=status.HTTP_201_CREATED)
async def upload_and_detect_ai_image(file: UploadFile = File(...)) -> AIImageDetectionResponse:
    """Convenience endpoint: Uploads an image and immediately executes PyTorch AI-image detection."""
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file filename provided.")

    file_ext = Path(file.filename).suffix.lower().lstrip(".")
    if file_ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported format '{file_ext}'. Allowed: {sorted(settings.ALLOWED_IMAGE_EXTENSIONS)}",
        )

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    if len(file_bytes) > settings.MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image exceeds size limit of {settings.MAX_IMAGE_SIZE_BYTES / (1024 * 1024):.0f} MB.",
        )

    import uuid

    media_id = str(uuid.uuid4())
    safe_filename = generate_storage_filename(file.filename)
    target_path = settings.UPLOAD_DIR / safe_filename
    target_path.write_bytes(file_bytes)

    display_format = "JPEG" if file_ext in {"jpg", "jpeg"} else file_ext.upper()
    sha256_hash = compute_sha256(file_bytes)
    save_media_record(
        media_id=media_id,
        original_filename=file.filename,
        storage_path=str(target_path),
        media_type="image",
        file_format=display_format,
        file_size_bytes=len(file_bytes),
        sha256_hash=sha256_hash,
    )

    try:
        detector = get_detector()
        result = detector.predict(target_path)
        result["media_id"] = media_id
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI model inference failed: {str(exc)}",
        ) from exc

    update_media_analysis(media_id, "ai_analysis", result)

    return AIImageDetectionResponse(**result)
