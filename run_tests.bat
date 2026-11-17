@echo off
cd /d "%~dp0"
echo ========================================================
echo Running MediaTrust AI Backend Automated Tests...
echo ========================================================
python -m pytest backend/tests -v
if %errorlevel% neq 0 (
    echo.
    echo Retrying with Python launcher 'py'...
    py -m pytest backend/tests -v
)
pause
