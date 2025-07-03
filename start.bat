@echo off
echo ===========================================
echo Healthcare Application with Blockchain
echo ===========================================

echo.
echo 1. Checking for required files...
if not exist "server.js" (
  echo ERROR: server.js not found!
  goto :error
)

echo.
echo 2. Starting server...
start cmd /k "node server.js"

echo.
echo 3. Waiting for server to initialize...
timeout /t 3 > nul

echo.
echo ===========================================
echo SERVER STARTED SUCCESSFULLY!
echo ===========================================
echo.
echo Your application is available at:
echo Local: http://localhost:3000
echo.
echo NOTE: You may see "Blockchain connection failed" messages.
echo This is normal if you don't have a local blockchain running.
echo The application will still work without blockchain features.
echo.
echo Press any key to exit this window. The server will continue running.
pause > nul
exit /b 0

:error
echo.
echo ERROR: Failed to start the application.
echo Please make sure all required files exist and try again.
echo.
echo Press any key to exit.
pause > nul
exit /b 1 