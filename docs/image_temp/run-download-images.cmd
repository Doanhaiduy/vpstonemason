@echo off
setlocal
cd /d "%~dp0"

echo Downloading stone reference images to docs/image_temp ...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0download-reference-images.ps1"

if errorlevel 1 (
  echo.
  echo Download failed. Check your internet connection or PowerShell policy.
  pause
  exit /b 1
)

echo.
echo Completed successfully.
pause
