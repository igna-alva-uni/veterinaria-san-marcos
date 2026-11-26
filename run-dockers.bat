@echo off
setlocal
pushd "%~dp0"
if errorlevel 1 exit /b 1
docker info >nul 2>&1
if errorlevel 1 (
    docker desktop start
    if errorlevel 1 goto failure
)
set /a ATTEMPTS=0
:waitDocker
docker info >nul 2>&1
if not errorlevel 1 goto start
set /a ATTEMPTS+=1
if %ATTEMPTS% GEQ 30 (
    echo Docker no estuvo disponible en el tiempo esperado.
    goto failure
)
timeout /t 2 /nobreak >nul
goto waitDocker
:start
docker compose config --quiet
if errorlevel 1 goto failure
docker compose up -d --build %*
if errorlevel 1 goto failure
docker compose ps
set "RESULT=%ERRORLEVEL%"
popd
exit /b %RESULT%
:failure
popd
exit /b 1
