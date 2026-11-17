from pathlib import Path
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.config import settings
from app.core.media_store import get_media_record, save_media_record, update_media_analysis
from app.core.security import compute_sha256, generate_storage_filename
from app.schemas.forensics_schema import C2PARecordResponse, MetadataAnalysisResponse
from app.services.member2_forensics.c2pa_verifier import verify_c2pa
from app.services.member2_forensics.metadata_extractor import analyze_metadata

router = APIRouter(prefix="/forensics", tags=["Digital Forensics & Metadata"])


@router.post("/metadata/{media_id}", response_model=MetadataAnalysisResponse)
def get_metadata(media_id: str) -> MetadataAnalysisResponse:
    """Extract and analyze EXIF, GPS, camera model, and video container stream metadata."""
    record = get_media_record(media_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Media '{media_id}' not found.")

    storage_path = Path(record["storage_path"])
    if not storage_path.exists():
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Media file missing from storage.")

    try:
        data = analyze_metadata(storage_path, record["media_type"])
        data["media_id"] = media_id
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Metadata extraction failed: {exc}") from exc

    update_media_analysis(media_id, "metadata_analysis", data)
    return MetadataAnalysisResponse(**data)


@router.post("/c2pa/{media_id}", response_model=C2PARecordResponse)
def verify_c2pa_credentials(media_id: str) -> C2PARecordResponse:
    """Verify C2PA Content Credentials and extract digital provenance assertions."""
    record = get_media_record(media_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Media '{media_id}' not found.")

    storage_path = Path(record["storage_path"])
    if not storage_path.exists():
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Media file missing from storage.")

    try:
        result = verify_c2pa(storage_path)
        result["media_id"] = media_id
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"C2PA verification failed: {exc}") from exc

    update_media_analysis(media_id, "c2pa_analysis", result)
    return C2PARecordResponse(**result)


@router.post("/metadata-upload", response_model=MetadataAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def upload_and_analyze_metadata(file: UploadFile = File(...)) -> MetadataAnalysisResponse:
    """Direct upload and metadata extraction."""
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file filename provided.")

    file_ext = Path(file.filename).suffix.lower().lstrip(".")
    media_type = "image" if file_ext in settings.ALLOWED_IMAGE_EXTENSIONS else "video"

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    import uuid

    media_id = str(uuid.uuid4())
    safe_filename = generate_storage_filename(file.filename)
    target_path = settings.UPLOAD_DIR / safe_filename
    target_path.write_bytes(file_bytes)

    save_media_record(
        media_id=media_id,
        original_filename=file.filename,
        storage_path=str(target_path),
        media_type=media_type,
        file_format=file_ext.upper(),
        file_size_bytes=len(file_bytes),
        sha256_hash=compute_sha256(file_bytes),
    )

    data = analyze_metadata(target_path, media_type)
    data["media_id"] = media_id
    update_media_analysis(media_id, "metadata_analysis", data)
    return MetadataAnalysisResponse(**data)


@router.post("/c2pa-upload", response_model=C2PARecordResponse, status_code=status.HTTP_201_CREATED)
async def upload_and_verify_c2pa(file: UploadFile = File(...)) -> C2PARecordResponse:
    """Direct upload and C2PA provenance verification."""
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file filename provided.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    import uuid

    media_id = str(uuid.uuid4())
    safe_filename = generate_storage_filename(file.filename)
    target_path = settings.UPLOAD_DIR / safe_filename
    target_path.write_bytes(file_bytes)

    file_ext = Path(file.filename).suffix.lower().lstrip(".")
    save_media_record(
        media_id=media_id,
        original_filename=file.filename,
        storage_path=str(target_path),
        media_type="image" if file_ext in settings.ALLOWED_IMAGE_EXTENSIONS else "video",
        file_format=file_ext.upper(),
        file_size_bytes=len(file_bytes),
        sha256_hash=compute_sha256(file_bytes),
    )

    result = verify_c2pa(target_path)
    result["media_id"] = media_id
    update_media_analysis(media_id, "c2pa_analysis", result)
    return C2PARecordResponse(**result)
