@echo off
echo ========================================
echo   WMS - Warehouse Management System
echo   Setup Script
echo ========================================
echo.

echo [1/4] Creating MySQL database...
mysql -u root -p < backend\init_db.sql
if %errorlevel% neq 0 (
    echo Failed to create database. Please check your MySQL credentials.
    pause
    exit /b 1
)

echo [2/4] Installing Python dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Failed to install Python dependencies.
    pause
    exit /b 1
)
cd ..

echo [3/4] Installing frontend dependencies...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies.
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo   Setup complete!
echo ========================================
echo.
echo To start the application:
echo.
echo   1. Start the backend:
echo      cd backend
echo      python app.py
echo.
echo   2. Start the frontend (in a new terminal):
echo      cd frontend
echo      npm start
echo.
echo   Default login: admin / admin123
echo.
pause
