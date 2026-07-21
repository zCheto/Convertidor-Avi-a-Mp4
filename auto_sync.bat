@echo off
title Sincronizador Automatico a GitHub (By Kiev)
echo ==================================================
echo   Sincronizando cambios a tu repositorio de GitHub...
echo ==================================================

git add .
git commit -m "Actualizacion automatica de archivos - By Kiev"
git push origin main

echo.
echo ==================================================
echo   ¡Cambios subidos a GitHub exitosamente!
echo ==================================================
pause
