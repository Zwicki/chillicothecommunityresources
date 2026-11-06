@echo off
title Chillicothe Community Resources Server (Port 4000)
cd /d "%~dp0"
echo ===================================================
echo Starting Chillicothe Community Resources Directory
echo URL: http://localhost:4000
echo ===================================================
echo Keep this window open while using the application.
node serve.cjs
pause
