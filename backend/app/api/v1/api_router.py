from fastapi import APIRouter

from app.api.v1.endpoints_ai_image import router as ai_image_router
from app.api.v1.endpoints_forensics import router as forensics_router
from app.api.v1.endpoints_image import router as image_router
from app.api.v1.endpoints_media import router as media_router
from app.api.v1.endpoints_monitoring import router as monitoring_router
from app.api.v1.endpoints_recycled_compression import router as recycled_compression_router
from app.api.v1.endpoints_reports_alerts import router as reports_alerts_router
from app.api.v1.endpoints_video import router as video_router

api_router = APIRouter()
api_router.include_router(media_router)
api_router.include_router(image_router)
api_router.include_router(ai_image_router)
api_router.include_router(forensics_router)
api_router.include_router(video_router)
api_router.include_router(recycled_compression_router)
api_router.include_router(reports_alerts_router)
api_router.include_router(monitoring_router)
