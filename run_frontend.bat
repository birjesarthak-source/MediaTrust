@echo off
cd /d "%~dp0frontend"
echo ========================================================
echo Starting MediaTrust AI Frontend (Vite on 0.0.0.0:5173)...
echo ========================================================
cmd /c npm run dev -- --host 0.0.0.0
pause
