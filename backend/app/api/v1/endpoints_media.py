import uuid
from pathlib import Path
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.config import settings
from app.core.media_store import get_media_record, list_media_records, save_media_record
from app.core.security import compute_sha256, generate_storage_filename
from app.schemas.media_schema import MediaDetailsResponse, MediaUploadResponse

router = APIRouter(prefix="/media", tags=["Media Management"])


@router.post("/upload", response_model=MediaUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_media(file: UploadFile = File(...)) -> MediaUploadResponse:
    """Upload an image or video file for authenticity and digital forensics verification.

    Validates file extensions, size limits, computes SHA-256 integrity checksum,
    and stores the file in secure internal storage.
    """
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file filename provided.")

    file_ext = Path(file.filename).suffix.lower().lstrip(".")
    if file_ext in settings.ALLOWED_IMAGE_EXTENSIONS:
        media_type = "image"
        max_size = settings.MAX_IMAGE_SIZE_BYTES
    elif file_ext in settings.ALLOWED_VIDEO_EXTENSIONS:
        media_type = "video"
        max_size = settings.MAX_VIDEO_SIZE_BYTES
    else:
        allowed_all = sorted(settings.ALLOWED_IMAGE_EXTENSIONS | settings.ALLOWED_VIDEO_EXTENSIONS)
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported format '{file_ext}'. Allowed formats: {allowed_all}",
        )

    file_bytes = await file.read()
    file_size = len(file_bytes)

    if file_size == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty (0 bytes).")

    if file_size > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {max_size / (1024 * 1024):.0f} MB.",
        )

    safe_filename = generate_storage_filename(file.filename)
    target_path = settings.UPLOAD_DIR / safe_filename

    # Save to disk
    target_path.write_bytes(file_bytes)

    # Cryptographic checksum
    sha256_hash = compute_sha256(file_bytes)
    media_id = str(uuid.uuid4())

    # Normalize format name
    display_format = "JPEG" if file_ext in {"jpg", "jpeg"} else file_ext.upper()

    record = save_media_record(
        media_id=media_id,
        original_filename=file.filename,
        storage_path=str(target_path),
        media_type=media_type,
        file_format=display_format,
        file_size_bytes=file_size,
        sha256_hash=sha256_hash,
    )

    return MediaUploadResponse(
        media_id=record["media_id"],
        original_filename=record["original_filename"],
        storage_path=record["storage_path"],
        media_type=record["media_type"],
        file_format=record["file_format"],
        file_size_bytes=record["file_size_bytes"],
        sha256_hash=record["sha256_hash"],
    )


@router.get("/{media_id}", response_model=MediaDetailsResponse)
def get_media(media_id: str) -> MediaDetailsResponse:
    """Retrieve metadata and registration details for a specific media item."""
    record = get_media_record(media_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Media with id '{media_id}' not found.")
    return MediaDetailsResponse(
        media_id=record["media_id"],
        original_filename=record["original_filename"],
        media_type=record["media_type"],
        file_format=record["file_format"],
        file_size_bytes=record["file_size_bytes"],
        sha256_hash=record["sha256_hash"],
        created_at=record["created_at"],
    )


@router.get("", response_model=list[MediaDetailsResponse])
def list_media(limit: int = 50) -> list[MediaDetailsResponse]:
    """List recent uploaded media items."""
    records = list_media_records(limit=limit)
    return [
        MediaDetailsResponse(
            media_id=r["media_id"],
            original_filename=r["original_filename"],
            media_type=r["media_type"],
            file_format=r["file_format"],
            file_size_bytes=r["file_size_bytes"],
            sha256_hash=r["sha256_hash"],
            created_at=r["created_at"],
        )
        for r in records
    ]
