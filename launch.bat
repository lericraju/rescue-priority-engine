@echo off
echo ==============================================
echo    LASTBREATH Rescue Priority Engine Launcher
echo ==============================================
echo.

echo [1/2] Launching Backend API Server (FastAPI)...
start "Backend Server" cmd /k ".\.venv\Scripts\activate.bat && python -m uvicorn backend.api.server:app --reload --host 0.0.0.0 --port 8000"

echo [2/2] Launching Frontend Dashboard (React)...
start "Frontend Dashboard" cmd /k "cd frontend && npm start"

echo.
echo Launch sequence initiated!
echo Two command prompt windows should have opened for the backend and frontend.
echo Your browser will automatically open the dashboard once the frontend finishes loading.
echo.
pause
