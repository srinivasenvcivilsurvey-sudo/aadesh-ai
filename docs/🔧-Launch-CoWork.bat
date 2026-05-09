@echo off
REM Open Co-work and auto-copy command
echo Opening Claude Co-work...
echo.

REM Copy command to clipboard
echo Read tasks from: C:\Users\north\OneDrive\Attachments\Desktop\Banu\tasks\pending\ and execute them. After completion, create completion report in completions\ folder. | clip

echo [OK] Command copied to clipboard!
echo.
echo Co-work will open in your browser in 3 seconds...
echo When it opens, press Ctrl+V to paste the command
echo.
timeout /t 3 /nobreak

start https://claude.ai/new?mode=cowork

echo.
echo [DONE] Co-work opened!
echo Paste with Ctrl+V
pause
