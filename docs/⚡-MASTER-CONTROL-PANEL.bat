@echo off
REM ========================================
REM   Claude Team Master Control Panel
REM   Non-Technical Friendly Interface
REM ========================================

:MENU
cls
echo.
echo ================================================
echo        CLAUDE TEAM CONTROL PANEL
echo ================================================
echo.
echo What would you like to do?
echo.
echo [1] Check Status (see what's happening)
echo [2] Launch Co-work (to execute tasks)
echo [3] Launch Code (to build software)
echo [4] View Task List (see pending work)
echo [5] View Completions (see finished work)
echo [6] Run Health Check (verify system)
echo [7] Open Banu Folder (in File Explorer)
echo [8] View Help Guide
echo [9] Exit
echo.
echo ================================================
echo.

set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto STATUS
if "%choice%"=="2" goto COWORK
if "%choice%"=="3" goto CODE
if "%choice%"=="4" goto TASKS
if "%choice%"=="5" goto COMPLETIONS
if "%choice%"=="6" goto HEALTH
if "%choice%"=="7" goto FOLDER
if "%choice%"=="8" goto HELP
if "%choice%"=="9" goto EXIT

echo Invalid choice. Please try again.
pause
goto MENU

:STATUS
cls
echo ================================================
echo              SYSTEM STATUS
echo ================================================
echo.
cd /d "C:\Users\north\OneDrive\Attachments\Desktop\Banu"

echo PENDING TASKS:
echo --------------
dir /b tasks\pending\*.json 2>nul | find /c /v "" > nul
if %errorlevel% equ 0 (
    dir /b tasks\pending\*.json
) else (
    echo   No pending tasks
)
echo.

echo COMPLETED TODAY:
echo ---------------
dir /b completions\*.json 2>nul | find /c /v "" > nul
if %errorlevel% equ 0 (
    dir /b /o-d completions\*.json | findstr /v "README" | more
) else (
    echo   No completions yet
)
echo.

echo IN PROGRESS:
echo -----------
dir /b tasks\in-progress\*.json 2>nul | find /c /v "" > nul
if %errorlevel% equ 0 (
    dir /b tasks\in-progress\*.json
) else (
    echo   Nothing in progress
)
echo.
echo ================================================
pause
goto MENU

:COWORK
cls
echo ================================================
echo         LAUNCHING CLAUDE CO-WORK
echo ================================================
echo.
echo Opening Co-work and copying command...
echo.

REM Copy command to clipboard
echo Read tasks from: C:\Users\north\OneDrive\Attachments\Desktop\Banu\tasks\pending\ and execute them. After completion, create completion report in completions\ folder. | clip

echo [OK] Command copied to clipboard!
echo.
echo NEXT STEPS:
echo 1. Co-work will open in your browser
echo 2. Press Ctrl+V to paste the command
echo 3. Co-work will auto-execute tasks
echo.
pause

start https://claude.ai/new?mode=cowork

echo.
echo [OK] Co-work opened! Paste the command (Ctrl+V)
echo.
pause
goto MENU

:CODE
cls
echo ================================================
echo          LAUNCHING CLAUDE CODE
echo ================================================
echo.
echo Opening Code and copying command...
echo.

REM Copy command to clipboard
echo Read tasks from: C:\Users\north\OneDrive\Attachments\Desktop\Banu\tasks\pending\ and execute them. After completion, create completion report in completions\ folder. | clip

echo [OK] Command copied to clipboard!
echo.
echo NEXT STEPS:
echo 1. Code will open in your browser
echo 2. Press Ctrl+V to paste the command
echo 3. Code will auto-execute tasks
echo.
pause

start https://claude.ai/new?mode=code

echo.
echo [OK] Code opened! Paste the command (Ctrl+V)
echo.
pause
goto MENU

:TASKS
cls
echo ================================================
echo            PENDING TASK LIST
echo ================================================
echo.
cd /d "C:\Users\north\OneDrive\Attachments\Desktop\Banu\tasks\pending"

dir /b *.json 2>nul | find /c /v "" > nul
if %errorlevel% equ 0 (
    for %%f in (*.json) do (
        echo Task: %%f
        echo --------
        type "%%f" | findstr /i "title"
        echo.
    )
) else (
    echo No tasks pending.
    echo.
    echo TIP: Create a new task in Claude Chat!
)
echo.
echo ================================================
pause
goto MENU

:COMPLETIONS
cls
echo ================================================
echo           COMPLETED WORK
echo ================================================
echo.
cd /d "C:\Users\north\OneDrive\Attachments\Desktop\Banu\completions"

dir /b *.json 2>nul | findstr /v "README" | find /c /v "" > nul
if %errorlevel% equ 0 (
    for %%f in (*.json) do (
        echo Completion: %%f
        echo --------
        type "%%f" | findstr /i "summary completed_by"
        echo.
    )
) else (
    echo No completions yet.
    echo.
    echo TIP: Run tasks in Co-work or Code first!
)
echo.
echo ================================================
pause
goto MENU

:HEALTH
cls
echo ================================================
echo           SYSTEM HEALTH CHECK
echo ================================================
echo.
cd /d "C:\Users\north\OneDrive\Attachments\Desktop\Banu"

echo Checking folder structure...
if exist "tasks\pending" (echo [OK] tasks\pending exists) else (echo [!] tasks\pending missing)
if exist "tasks\in-progress" (echo [OK] tasks\in-progress exists) else (echo [!] tasks\in-progress missing)
if exist "tasks\archived" (echo [OK] tasks\archived exists) else (echo [!] tasks\archived missing)
if exist "completions" (echo [OK] completions exists) else (echo [!] completions missing)
if exist "shared-context" (echo [OK] shared-context exists) else (echo [!] shared-context missing)
echo.

echo Checking system files...
if exist "MASTER-README.md" (echo [OK] MASTER-README.md) else (echo [!] Documentation missing)
if exist "check-completions.py" (echo [OK] check-completions.py) else (echo [!] Tools missing)
if exist "TEAM-CAPABILITIES.md" (echo [OK] TEAM-CAPABILITIES.md) else (echo [!] Registry missing)
echo.

echo Checking shortcuts...
if exist "🔧-Launch-CoWork.bat" (echo [OK] Co-work launcher) else (echo [!] Launcher missing)
if exist "💻-Launch-Code.bat" (echo [OK] Code launcher) else (echo [!] Launcher missing)
echo.

echo ================================================
echo.
echo System health check complete!
echo.
pause
goto MENU

:FOLDER
cls
echo ================================================
echo        OPENING BANU FOLDER
echo ================================================
echo.
echo Opening folder in File Explorer...
start explorer "C:\Users\north\OneDrive\Attachments\Desktop\Banu"
echo.
echo [OK] Folder opened!
echo.
pause
goto MENU

:HELP
cls
echo ================================================
echo              HELP GUIDE
echo ================================================
echo.
echo HOW THE SYSTEM WORKS:
echo.
echo 1. Chat (this mode) creates tasks
echo 2. You open Co-work or Code to execute tasks
echo 3. They complete work and report back
echo 4. Chat reads completions automatically
echo.
echo WORKFLOW:
echo.
echo   Chat → Creates task → Saved to pending/
echo                              |
echo                              v
echo   You → Open Co-work → Executes → Completion saved
echo                              |
echo                              v
echo   Chat → Reads completion → Knows what happened
echo.
echo FILES LOCATION:
echo C:\Users\north\OneDrive\Attachments\Desktop\Banu\
echo.
echo KEY FOLDERS:
echo - tasks\pending\     = Tasks waiting to run
echo - completions\       = Finished work reports
echo - shared-context\    = Files created by Code/Co-work
echo.
echo USEFUL TIPS:
echo - Use option [1] to see current status
echo - Use option [2] or [3] to execute tasks
echo - Check completions\ to see what's done
echo.
echo ================================================
pause
goto MENU

:EXIT
cls
echo.
echo Thank you for using Claude Team Control Panel!
echo.
pause
exit
