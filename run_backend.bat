@echo off
echo Starting LoanSight FastAPI Backend Server on port 8001...
cd /d "%~dp0loansight\backend"
python -m uvicorn app.main:app --reload --port 8001 --host 127.0.0.1
pause
