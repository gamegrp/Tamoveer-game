@echo off
setlocal
title Tamoveer - Desktop Preview
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js not installed. Download Node.js LTS from https://nodejs.org/
  pause
  exit /b 1
)
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo npm install failed. Check internet connection.
  pause
  exit /b 1
)
call npm run check
if errorlevel 1 (
  echo Project validation failed.
  pause
  exit /b 1
)
call npm start
endlocal
