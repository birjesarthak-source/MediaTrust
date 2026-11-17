@echo off
cd /d "%~dp0backend"
echo ========================================================
echo Starting MediaTrust AI Backend (FastAPI on 0.0.0.0:8000)...
echo ========================================================
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
if %errorlevel% neq 0 (
    echo.
    echo Retrying with Python launcher 'py'...
    py -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
)
pause
