@echo off

REM Begin -  Trick to run as admin
set "params=%*"
cd /d "%~dp0" && ( if exist "%temp%\getadmin.vbs" del "%temp%\getadmin.vbs" ) && fsutil dirty query %systemdrive% 1>nul 2>nul || (  echo Set UAC = CreateObject^("Shell.Application"^) : UAC.ShellExecute "cmd.exe", "/c cd ""%~sdp0"" && %~s0 %params%", "", "runas", 1 >> "%temp%\getadmin.vbs" && "%temp%\getadmin.vbs" && exit /B )
REM End -    Trick to run as admin

REM Should need node?
echo Installing nodejs 13 if needed
where node.exe >nul 2>&1 && echo + skipping nodejs  || .\install\installnodejs.vbs

.\install\resetvars.vbs
call "%TEMP%\resetvars.bat"

where yarn >nul 2>&1 && echo + skipping yarn || cmd /c npm install -g yarn

.\install\resetvars.vbs
call "%TEMP%\resetvars.bat"

echo Installing windows build tools...
cmd /c yarn global add windows-build-tools node-gyp

echo Completing instalation by setting up everything
yarn

echo.
echo.
echo Ready to start.
echo.
echo.
pause