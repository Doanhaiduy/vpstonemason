@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
set "PY_SCRIPT=%SCRIPT_DIR%add_watermark_and_label.py"
REM ═══════════════════════════════════════════════════════
REM   PVStoneau - Watermark & Label Tool
REM   Usage: watermark.cmd <post-folder-name> [options]
REM
REM   Examples:
REM     watermark.cmd 2026-04-05-VP1017
REM     watermark.cmd 2026-04-05-collection
REM     watermark.cmd 2026-04-05-VP1017 --dry-run
REM     watermark.cmd 2026-04-05-VP1017 --lossless-png
REM ═══════════════════════════════════════════════════════

if "%~1"=="" (
  echo.
  echo Usage: watermark.cmd ^<post-folder-name^> [options]
  echo.
  echo   Single stone:  watermark.cmd 2026-04-05-VP1017
  echo   Multi stone:   watermark.cmd 2026-04-05-collection
  echo   Dry run:       watermark.cmd 2026-04-05-VP1017 --dry-run
  echo.
  pause
  exit /b 1
)

set "POST_NAME=%~1"
shift

REM Collect remaining args
set "EXTRA_ARGS="
:argloop
if "%~1"=="" goto run
set "EXTRA_ARGS=%EXTRA_ARGS% %1"
shift
goto argloop

:run
if not exist "%PY_SCRIPT%" (
  echo.
  echo ❌ Tool script not found: %PY_SCRIPT%
  exit /b 1
)

where py >nul 2>nul
if %errorlevel%==0 (
  py -3 "%PY_SCRIPT%" --post "%POST_NAME%" %EXTRA_ARGS%
) else (
  python "%PY_SCRIPT%" --post "%POST_NAME%" %EXTRA_ARGS%
)

if errorlevel 1 (
  echo.
  echo ❌ Processing failed.
  exit /b 1
)

echo.
echo ✅ Completed! Check the "final" folder inside your post directory.
