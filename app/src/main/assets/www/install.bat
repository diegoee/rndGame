@echo off
cls
echo install node_modules ...  
rmdir /S /Q node_modules    
del package-lock.json  
npm install
pause 
exit 

