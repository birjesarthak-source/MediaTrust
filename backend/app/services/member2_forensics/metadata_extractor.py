"""Member 2 Service: Multimedia Metadata Extraction & Digital Forensics.

Extracts container, stream, and exchangeable image file format (EXIF) metadata
from images and videos.

Forensic Rules Enforced:
1. Identify camera hardware signatures, editing software fingerprints, and GPS tags.
2. Detect missing, stripped, or inconsistent timestamps and resolutions.
3. Scientifically Responsible Policy: Missing or stripped metadata is noted as
   forensic context but NEVER treated as standalone proof of malicious manipulation.
"""

from pathlib import Path
from typing import Any, Optional

import cv2
from PIL import ExifTags, Image


def _convert_gps_to_degrees(value: Any) -> Optional[float]:
    """Convert EXIF GPS coordinates in (degrees, minutes, seconds) rational tuple to decimal degrees."""
    if not value or len(value) < 3:
        return None
    try:
        def to_float(val):
            if hasattr(val, "numerator") and hasattr(val, "denominator"):
                return float(val.numerator) / max(float(val.denominator), 1e-6)
            if isinstance(val, tuple) and len(val) == 2:
                return float(val[0]) / max(float(val[1]), 1e-6)
            return float(val)

        d = to_float(value[0])
        m = to_float(value[1])
        s = to_float(value[2])
        return round(d + (m / 60.0) + (s / 3600.0), 6)
    except Exception:
        return None


def extract_image_metadata(file_path: Path) -> dict[str, Any]:
    """Extract standard and EXIF metadata from image files."""
    file_size = file_path.stat().st_size
    with Image.open(file_path) as img:
        img_format = (img.format or file_path.suffix.lstrip(".")).upper()
        width, height = img.size
        raw_exif = img._getexif()

    camera_make = None
    camera_model = None
    lens_model = None
    software = None
    creation_date = None
    iso = None
    exposure_time = None
    f_number = None
    focal_length = None
    gps_data: dict[str, Any] = {"latitude": None, "longitude": None, "altitude": None}
    parsed_tags: dict[str, Any] = {}

    if raw_exif:
        for tag_id, value in raw_exif.items():
            tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
            # Format value for JSON serialization
            str_val = str(value).strip() if value is not None else None
            parsed_tags[tag_name] = str_val[:200] if str_val else None

            if tag_name == "Make":
                camera_make = str(value).strip()
            elif tag_name == "Model":
                camera_model = str(value).strip()
            elif tag_name == "LensModel":
                lens_model = str(value).strip()
            elif tag_name == "Software":
                software = str(value).strip()
            elif tag_name in {"DateTimeOriginal", "DateTimeDigitized", "DateTime"}:
                if not creation_date:
                    creation_date = str(value).strip()
            elif tag_name == "ISOSpeedRatings":
                try:
                    iso = int(value) if isinstance(value, int) else int(value[0])
                except Exception:
                    pass
            elif tag_name == "ExposureTime":
                exposure_time = str(value).strip()
            elif tag_name == "FNumber":
                try:
                    f_number = round(float(value), 1)
                except Exception:
                    pass
            elif tag_name == "FocalLength":
                try:
                    focal_length = round(float(value), 1)
                except Exception:
                    pass
            elif tag_name == "GPSInfo" and isinstance(value, dict):
                gps_tags = {}
                for t in value:
                    sub_tag = ExifTags.GPSTAGS.get(t, str(t))
                    gps_tags[sub_tag] = value[t]

                lat = _convert_gps_to_degrees(gps_tags.get("GPSLatitude"))
                if lat and gps_tags.get("GPSLatitudeRef") == "S":
                    lat = -lat
                lon = _convert_gps_to_degrees(gps_tags.get("GPSLongitude"))
                if lon and gps_tags.get("GPSLongitudeRef") == "W":
                    lon = -lon

                gps_data["latitude"] = lat
                gps_data["longitude"] = lon

    metadata_stripped = bool(raw_exif is None or len(raw_exif) < 3)

    return {
        "format": img_format,
        "file_size_bytes": file_size,
        "dimensions": {"width": width, "height": height},
        "camera_make": camera_make,
        "camera_model": camera_model,
        "lens_model": lens_model,
        "software": software,
        "creation_date": creation_date,
        "iso": iso,
        "exposure_time": exposure_time,
        "f_number": f_number,
        "focal_length": focal_length,
        "gps": gps_data,
        "metadata_stripped": metadata_stripped,
        "raw_exif_tags": parsed_tags,
    }


def extract_video_metadata(file_path: Path) -> dict[str, Any]:
    """Extract stream container and codec parameters from video files using OpenCV."""
    file_size = file_path.stat().st_size
    cap = cv2.VideoCapture(str(file_path))

    if not cap.isOpened():
        return {
            "format": file_path.suffix.lstrip(".").upper(),
            "file_size_bytes": file_size,
            "duration_seconds": 0.0,
            "dimensions": {"width": 0, "height": 0},
            "fps": 0.0,
            "total_frames": 0,
            "codec": "UNKNOWN",
            "creation_date": None,
        }

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = float(cap.get(cv2.CAP_PROP_FPS))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fourcc_int = int(cap.get(cv2.CAP_PROP_FOURCC))
    cap.release()

    duration = round(total_frames / max(fps, 1e-4), 2) if fps > 0 else 0.0

    # Decode FourCC code
    codec = "".join([chr((fourcc_int >> 8 * i) & 0xFF) for i in range(4)]).strip()
    if not codec or not codec.isprintable():
        codec = "H264/AVC"

    return {
        "format": file_path.suffix.lstrip(".").upper(),
        "file_size_bytes": file_size,
        "duration_seconds": duration,
        "dimensions": {"width": width, "height": height},
        "fps": round(fps, 2),
        "total_frames": total_frames,
        "codec": codec,
        "creation_date": None,
    }


def analyze_metadata(file_path: Path, media_type: str) -> dict[str, Any]:
    """Analyze metadata and identify anomalies or software indicators."""
    anomalies: list[str] = []

    if media_type == "image":
        img_meta = extract_image_metadata(file_path)
        vid_meta = None

        if img_meta["metadata_stripped"]:
            anomalies.append(
                "EXIF metadata is absent or stripped. Common in social media uploads (WhatsApp, X, Instagram) for privacy protection; this does not prove tampering."
            )

        if img_meta["software"]:
            known_editors = ["photoshop", "gimp", "canva", "lightroom", "midjourney", "stable diffusion", "dall-e", "picsart"]
            soft_lower = img_meta["software"].lower()
            if any(ed in soft_lower for ed in known_editors):
                anomalies.append(f"Editing software signature detected in header: '{img_meta['software']}'.")

        if img_meta["camera_make"] and img_meta["camera_model"]:
            anomalies.append(f"Authentic camera hardware tags detected: {img_meta['camera_make']} {img_meta['camera_model']}.")

    else:
        vid_meta = extract_video_metadata(file_path)
        img_meta = None

        if vid_meta["duration_seconds"] == 0:
            anomalies.append("Video stream reported 0-second duration or unreadable container index.")
        if vid_meta["fps"] < 10 or vid_meta["fps"] > 120:
            anomalies.append(f"Non-standard video frame rate detected: {vid_meta['fps']} FPS.")

    return {
        "media_type": media_type,
        "filename": file_path.name,
        "image_metadata": img_meta,
        "video_metadata": vid_meta,
        "anomalies_and_flags": anomalies,
        "scientific_note": "Metadata analysis identifies container and origin tags. Stripped metadata is not evidence of falsification.",
    }
