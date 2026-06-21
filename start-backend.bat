@echo off
echo Starting WMS Backend - CHERENZ GLOBAL MFG. INC.
echo ================================================
cd /d C:\projects\WMS\backend
call venv\Scripts\activate.bat
python app.py
pause
