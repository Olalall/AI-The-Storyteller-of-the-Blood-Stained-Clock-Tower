@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\portable\Start-Storyteller.ps1" %*
if errorlevel 1 pause
