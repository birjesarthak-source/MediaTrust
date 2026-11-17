@echo off
echo ======================================================================
echo  MediaTrust AI - Instant Live Public Tunnel Generator
echo ======================================================================
echo.
echo Make sure your frontend (npm run dev) is running on port 5173!
echo Starting secure public tunnel...
echo.
npx --yes localtunnel --port 5173
pause
