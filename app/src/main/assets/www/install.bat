@echo off
cls
call uninstall.bat 
echo Installing ...  
call npm install  
TIMEOUT /T 15 
exit 

