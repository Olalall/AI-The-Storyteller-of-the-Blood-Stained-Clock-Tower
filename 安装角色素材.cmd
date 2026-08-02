@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\portable\Install-CharacterAssets.ps1"
pause
