@echo off
setlocal
cd /d "%~dp0"

set "INPUT_DIR=%~dp0"
set "OUTPUT_DIR=%~dp0watermarked"
set "WATERMARK_TEXT=PVstoneau"

where py >nul 2>nul
if %errorlevel%==0 (
  py -3 "%~dp0add_watermark_and_label.py" --input-dir "%INPUT_DIR%" --output-dir "%OUTPUT_DIR%" --watermark-text "%WATERMARK_TEXT%" %*
) else (
  python "%~dp0add_watermark_and_label.py" --input-dir "%INPUT_DIR%" --output-dir "%OUTPUT_DIR%" --watermark-text "%WATERMARK_TEXT%" %*
)

if errorlevel 1 (
  echo.
  echo Failed to process images.
  pause
  exit /b 1
)

echo.
echo Completed. Output folder: %OUTPUT_DIR%
pause