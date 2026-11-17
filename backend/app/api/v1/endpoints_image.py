from pathlib import Path
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.config import settings
from app.core.media_store import get_media_record, save_media_record, update_media_analysis
from app.core.security import compute_sha256, generate_storage_filename
from app.schemas.analysis_schema import PixelAnalysisResponse
from app.services.member1_ai_vision.pixel_forensics import analyze_image_pixels

router = APIRouter(prefix="/analysis", tags=["Image Pixel Forensics"])


@router.post("/pixel/{media_id}", response_model=PixelAnalysisResponse)
def run_pixel_analysis(media_id: str) -> PixelAnalysisResponse:
    """Execute pixel-level forensics on an already uploaded image by media_id.

    Extracts:
    - RGB channel statistics & 256-bin histograms
    - Laplacian edge variance and Sobel density
    - Local texture entropy and variance
    - Noise residual variance (via median filter subtraction)
    - Error Level Analysis (ELA) divergence metrics
    - 2D-FFT frequency spectrum energy distribution
    """
    record = get_media_record(media_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Media record '{media_id}' not found.")

    if record["media_type"] != "image":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Pixel analysis is only valid for images. This media is registered as '{record['media_type']}'.",
        )

    storage_path = Path(record["storage_path"])
    if not storage_path.exists():
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Media file is missing from internal storage.",
        )

    try:
        pixel_data = analyze_image_pixels(storage_path)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process pixel forensics: {str(exc)}",
        ) from exc

    # Persist analysis in store
    update_media_analysis(media_id, "pixel_analysis", pixel_data)

    return PixelAnalysisResponse(
        media_id=media_id,
        filename=record["original_filename"],
        dimensions=pixel_data["dimensions"],
        channel_statistics=pixel_data["channel_statistics"],
        histograms=pixel_data["histograms"],
        edge_analysis=pixel_data["edge_analysis"],
        texture_analysis=pixel_data["texture_analysis"],
        noise_analysis=pixel_data["noise_analysis"],
        error_level_analysis=pixel_data["error_level_analysis"],
        frequency_analysis=pixel_data["frequency_analysis"],
        scientific_notes=pixel_data["scientific_notes"],
    )


@router.post("/pixel-upload", response_model=PixelAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def upload_and_analyze_pixel(file: UploadFile = File(...)) -> PixelAnalysisResponse:
    """Convenience endpoint: Uploads an image and immediately executes pixel forensics.

    Returns full pixel-level evidence in a single HTTP transaction.
    """
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file provided.")

    file_ext = Path(file.filename).suffix.lower().lstrip(".")
    if file_ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"File '{file_ext}' is not a supported image format. Allowed: {sorted(settings.ALLOWED_IMAGE_EXTENSIONS)}",
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

    sha256_hash = compute_sha256(file_bytes)
    display_format = "JPEG" if file_ext in {"jpg", "jpeg"} else file_ext.upper()
    record = save_media_record(
        media_id=media_id,
        original_filename=file.filename,
        storage_path=str(target_path),
        media_type="image",
        file_format=display_format,
        file_size_bytes=len(file_bytes),
        sha256_hash=sha256_hash,
    )

    try:
        pixel_data = analyze_image_pixels(target_path)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pixel analysis failed: {str(exc)}",
        ) from exc

    update_media_analysis(media_id, "pixel_analysis", pixel_data)

    return PixelAnalysisResponse(
        media_id=media_id,
        filename=record["original_filename"],
        dimensions=pixel_data["dimensions"],
        channel_statistics=pixel_data["channel_statistics"],
        histograms=pixel_data["histograms"],
        edge_analysis=pixel_data["edge_analysis"],
        texture_analysis=pixel_data["texture_analysis"],
        noise_analysis=pixel_data["noise_analysis"],
        error_level_analysis=pixel_data["error_level_analysis"],
        frequency_analysis=pixel_data["frequency_analysis"],
        scientific_notes=pixel_data["scientific_notes"],
    )
