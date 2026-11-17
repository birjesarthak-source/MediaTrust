import os
from pathlib import Path


class Settings:
    PROJECT_NAME: str = "MediaTrust AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DESCRIPTION: str = "AI-Powered Multimedia Authenticity and Misinformation Detection System"

    # Base paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    STORAGE_DIR: Path = BASE_DIR / "storage"
    UPLOAD_DIR: Path = STORAGE_DIR / "uploads"
    FRAME_DIR: Path = STORAGE_DIR / "frames"
    REPORT_DIR: Path = STORAGE_DIR / "reports"

    # Allowed extensions
    ALLOWED_IMAGE_EXTENSIONS: set[str] = {"jpg", "jpeg", "png", "webp", "bmp", "tiff"}
    ALLOWED_VIDEO_EXTENSIONS: set[str] = {"mp4", "avi", "mov", "mkv", "webm"}

    # File size limits (bytes)
    MAX_IMAGE_SIZE_BYTES: int = 50 * 1024 * 1024       # 50 MB
    MAX_VIDEO_SIZE_BYTES: int = 250 * 1024 * 1024      # 250 MB

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173", "*"]

    # Database settings (MySQL)
    MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT: int = int(os.getenv("MYSQL_PORT", "3306"))
    MYSQL_USER: str = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_DB: str = os.getenv("MYSQL_DB", "mediatrust_db")

    @property
    def DATABASE_URL(self) -> str:
        if self.MYSQL_PASSWORD:
            return f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}?charset=utf8mb4"
        return f"mysql+pymysql://{self.MYSQL_USER}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}?charset=utf8mb4"


settings = Settings()

# Ensure directories exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.FRAME_DIR.mkdir(parents=True, exist_ok=True)
settings.REPORT_DIR.mkdir(parents=True, exist_ok=True)
