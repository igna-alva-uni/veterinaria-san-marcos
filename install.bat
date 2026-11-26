@echo off
setlocal
pushd "%~dp0"
if errorlevel 1 exit /b 1
echo Actualizando dependencias e instalando los modulos Maven...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0veterinaria-san-marcos-back\limpiar-target.ps1"
if errorlevel 1 goto failure
call mvn -B -ntp -U -f veterinaria-san-marcos-back\pom.xml clean install %*
set "RESULT=%ERRORLEVEL%"
popd
exit /b %RESULT%
:failure
popd
exit /b 1
