@echo off
title AniRyu Development
echo ========================================
echo    AniRyu Development Environment
echo ========================================
echo.

echo [1/2] Starting Go Backend Server...
start "AniRyu Backend" cmd /k "cd /d %~dp0backend && echo Starting backend server... && go run cmd/server/main.go"

echo [2/2] Starting React Frontend...
start "AniRyu Frontend" cmd /k "cd /d %~dp0 && echo Starting frontend server... && pnpm run dev"

echo.
echo Both servers are starting!
echo.
echo  Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
echo Press any key to close this window...
pause > nul
