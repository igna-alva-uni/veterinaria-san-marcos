@echo off
setlocal
pushd "%~dp0.."
docker compose up --build %*
set "RESULT=%ERRORLEVEL%"
popd
exit /b %RESULT%
