@echo off
echo Starting LoanSight Frontend Server on port 5173...
cd /d "%~dp0loansight\frontend"
npm.cmd run dev
pause
