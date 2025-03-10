@echo off
setlocal

REM Set the folder level
set BASE_DIR=%~dp0

REM Set the subdirectories
set BACKEND_DIR=%BASE_DIR%backend
set FRONTEND_DIR=%BASE_DIR%frontend

REM Change directory to the backend and start the server
cd /d %BACKEND_DIR%
start cmd /k "npm start"

REM Change directory to the frontend and start the server
cd /d %FRONTEND_DIR%
start cmd /k "npm start"

endlocal
