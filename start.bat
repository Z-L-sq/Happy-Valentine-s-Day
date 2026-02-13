@echo off
title 214 Valentine Game
cd /d "%~dp0"
echo Starting 214 Valentine Game...
echo.
echo Opening browser in 3 seconds...
start "" /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"
call npx next dev -p 3000
pause
