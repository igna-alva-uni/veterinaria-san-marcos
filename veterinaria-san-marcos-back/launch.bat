@echo off
setlocal

:MENU
cls
echo.
echo ============================================
echo   Biblioteca - MENU PRINCIPAL
echo ============================================
echo.
echo   [1] Iniciar todos los servicios (dev)
echo   [2] Iniciar todos los servicios (test)
echo   [3] Compilar microservicios
echo   [4] Reinstalar dependencias Maven
echo.
echo   --- Servicios individuales ---
echo   [5] Iniciar Eureka
echo   [6] Iniciar ms-api-gateway
echo   [7] Iniciar ms-usuarios
echo   [8] Iniciar ms-citas
echo   [9] Iniciar ms-pacientes
echo   [10] Iniciar ms-commons
echo.
echo   [0] Salir
echo.
echo ============================================
set /p opcion="  Selecciona una opcion: "

if "%opcion%"=="1" goto RUN_ALL
if "%opcion%"=="2" goto RUN_TEST
if "%opcion%"=="3" goto COMPILE
if "%opcion%"=="4" goto INSTALL
if "%opcion%"=="5" goto RUN_EUREKA
if "%opcion%"=="6" goto RUN_API_GATEWAY
if "%opcion%"=="7" goto RUN_USUARIOS
if "%opcion%"=="8" goto RUN_CITAS
if "%opcion%"=="9" goto RUN_PACIENTES
if "%opcion%"=="10" goto RUN_COMMONS
if "%opcion%"=="0" goto SALIR

echo.
echo   Opcion invalida. Intenta de nuevo.
timeout /t 2 /nobreak > nul
goto MENU

REM ============================================

:RUN_ALL
cls
echo.
echo ===== Iniciando Eureka Server =====
start "EUREKA" mvn -f eureka spring-boot:run
timeout /t 5 /nobreak > nul
echo ===== Iniciando Microservicios =====
start "MS-API-GATEWAY" mvn -f ms-api-gateway spring-boot:run
start "MS-USUARIOS" mvn -f ms-usuarios spring-boot:run
start "MS-CITAS" mvn -f ms-citas spring-boot:run
start "MS-PACIENTES" mvn -f ms-pacientes spring-boot:run
start "MS-COMMONS" mvn -f ms-commons spring-boot:run
echo Todos los servicios han sido lanzados.
pause
goto MENU

:RUN_TEST
cls
echo.
echo ===== Iniciando Eureka Server (test) =====
start "EUREKA" java -jar eureka\target\cl-VeterinariaSanMarcos-eureka-1.0-SNAPSHOT.jar --spring.profiles.active=test
timeout /t 5 /nobreak > nul
echo ===== Iniciando Microservicios (test) =====
start "MS-API-GATEWAY" java -jar ms-api-gateway\\target\\cl-VeterinariaSanMarcos-api-gateway-0.0.1-SNAPSHOT.jar --spring.profiles.active=test
start "MS-USUARIOS" java -jar ms-usuarios\\target\\cl-VeterinariaSanMarcos-usuarios-0.0.1-SNAPSHOT.jar --spring.profiles.active=test
start "MS-CITAS" java -jar ms-citas\\target\\cl-VeterinariaSanMarcos-citas-0.0.1-SNAPSHOT.jar --spring.profiles.active=test
start "MS-PACIENTES" java -jar ms-pacientes\\target\\cl-VeterinariaSanMarcos-pacientes-0.0.1-SNAPSHOT.jar --spring.profiles.active=test
start "MS-COMMONS" java -jar ms-commons\\target\\cl-VeterinariaSanMarcos-commons-0.0.1-SNAPSHOT.jar --spring.profiles.active=test
echo Todos los servicios han sido lanzados en modo test.
pause
goto MENU

:COMPILE
cls
echo.
echo ===== Compilando microservicios =====
cd /d C:\veterinaria-san-marcos-back\ms-api-gateway
call mvn clean install -U
cd /d C:\veterinaria-san-marcos-back\ms-usuarios
call mvn clean install -U
cd /d C:\veterinaria-san-marcos-back\ms-citas
call mvn clean install -U
cd /d C:\veterinaria-san-marcos-back\ms-pacientes
call mvn clean install -U
cd /d C:\veterinaria-san-marcos-back\ms-commons
call mvn clean install -U
echo Compilacion completada.
pause
goto MENU

:INSTALL
cls
echo.
echo === REINSTALACION DE DEPENDENCIAS MAVEN ===
echo.
echo Eliminando carpeta .m2 ...
rmdir /s /q %USERPROFILE%\.m2
echo Eliminando carpetas target ...
rmdir /s /q C:\veterinaria-san-marcos-back\eureka\target
rmdir /s /q C:\veterinaria-san-marcos-back\ms-api-gateway\target
rmdir /s /q C:\veterinaria-san-marcos-back\ms-usuarios\target
rmdir /s /q C:\veterinaria-san-marcos-back\ms-citas\target
rmdir /s /q C:\veterinaria-san-marcos-back\ms-pacientes\target
rmdir /s /q C:\veterinaria-san-marcos-back\ms-commons\target
echo Descargando dependencias nuevamente con Maven ...
mvn clean install -U -DskipTests
echo.
echo === PROCESO COMPLETADO ===
pause
goto MENU

:RUN_EUREKA
cls
echo.
echo ===== Iniciando Eureka =====
start "EUREKA" mvn -f eureka spring-boot:run
echo Eureka iniciado.
pause
goto MENU

:RUN_API_GATEWAY
cls
echo.
echo ===== Iniciando ms-api-gateway =====
start "MS-API-GATEWAY" mvn -f ms-api-gateway spring-boot:run
echo ms-api-gateway iniciado.
pause
goto MENU

:RUN_USUARIOS
cls
echo.
echo ===== Iniciando ms-usuarios =====
start "MS-USUARIOS" mvn -f ms-usuarios spring-boot:run
echo ms-usuarios iniciado.
pause
goto MENU

:RUN_CITAS
cls
echo.
echo ===== Iniciando ms-citas =====
start "MS-CITAS" mvn -f ms-citas spring-boot:run
echo ms-citas iniciado.
pause
goto MENU

:RUN_PACIENTES
cls
echo.
echo ===== Iniciando ms-pacientes =====
start "MS-PACIENTES" mvn -f ms-pacientes spring-boot:run
echo ms-pacientes iniciado.
pause
goto MENU

:RUN_COMMONS
cls
echo.
echo ===== Iniciando ms-commons =====
start "MS-COMMONS" mvn -f ms-commons spring-boot:run
echo ms-commons iniciado.
pause
goto MENU

:SALIR
cls
echo.
echo   Hasta luego.
echo.
endlocal
exit /b
