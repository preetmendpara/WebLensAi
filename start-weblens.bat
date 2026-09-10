@echo off
setlocal EnableDelayedExpansion
title WebLens AI - launcher
cd /d "%~dp0"

echo.
echo   WebLens AI
echo   ----------
echo.

REM --- Node present? -------------------------------------------------
where node >nul 2>&1
if errorlevel 1 (
    echo   [X] Node.js was not found on PATH.
    echo       Install Node.js 20 or newer from https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM --- Server credentials present? ------------------------------------
if not exist "server\.env" (
    echo   [X] server\.env is missing.
    echo       Copy server\.env.example to server\.env and fill in the keys.
    echo.
    pause
    exit /b 1
)

REM --- Dependencies ---------------------------------------------------
if not exist "server\node_modules" (
    echo   Installing server dependencies, this runs once...
    call npm --prefix server install --no-fund --no-audit
    if errorlevel 1 goto :installfailed
)
if not exist "client\node_modules" (
    echo   Installing client dependencies, this runs once...
    call npm --prefix client install --no-fund --no-audit
    if errorlevel 1 goto :installfailed
)

REM --- Already running? Reuse rather than starting a second copy. ------
set "APIUP="
set "WEBUP="
netstat -ano | findstr /r /c:":5174 .*LISTENING" >nul 2>&1 && set "APIUP=1"
netstat -ano | findstr /r /c:":5173 .*LISTENING" >nul 2>&1 && set "WEBUP=1"

if defined APIUP (
    echo   API already running on port 5174.
) else (
    echo   Starting API on port 5174...
    start "WebLens API" /D "%~dp0server" cmd /k npm run dev
)

if defined WEBUP (
    echo   Client already running on port 5173.
) else (
    echo   Starting client on port 5173...
    start "WebLens Client" /D "%~dp0client" cmd /k npm run dev
)

REM --- Wait for the client to answer before opening the browser -------
echo   Waiting for http://localhost:5173 ...
set /a TRIES=0
:waitloop
set /a TRIES+=1
curl -s -o nul --max-time 2 http://localhost:5173 && goto :ready
if !TRIES! GEQ 60 goto :timedout
ping -n 2 127.0.0.1 >nul
goto :waitloop

:ready
echo.
echo   Ready. Opening http://localhost:5173
start "" http://localhost:5173
echo.
echo   Client : http://localhost:5173
echo   API    : http://localhost:5174/api/health
echo.
echo   Two terminal windows are now running the servers.
echo   Close those windows, or press Ctrl+C inside them, to stop WebLens.
echo.
ping -n 7 127.0.0.1 >nul
exit /b 0

:timedout
echo.
echo   [X] The client did not respond within 60 seconds.
echo       Check the "WebLens Client" window for errors.
echo.
pause
exit /b 1

:installfailed
echo.
echo   [X] npm install failed. See the messages above.
echo.
pause
exit /b 1
