@echo off 
cls
echo uninstall ...
rmdir /S /Q node_modules    
del package-lock.json 
TIMEOUT /T 5 
exit 

