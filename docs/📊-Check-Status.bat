@echo off
REM Quick status viewer
cls
echo.
echo ================================================
echo              QUICK STATUS CHECK
echo ================================================
echo.
cd /d "C:\Users\north\OneDrive\Attachments\Desktop\Banu"

echo TASKS WAITING:
dir /b tasks\pending\*.json 2>nul | find /c /v ""

echo.
echo TASKS IN PROGRESS:
dir /b tasks\in-progress\*.json 2>nul | find /c /v ""

echo.
echo COMPLETED TODAY:
dir /b completions\*.json 2>nul | findstr /v "README" | find /c /v ""

echo.
echo ================================================
echo.
pause
