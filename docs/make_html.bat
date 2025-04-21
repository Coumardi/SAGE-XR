@echo off
REM Navigate to the Sphinx project directory
cd path\to\your\sphinx\project

REM Clean the build directory
echo Cleaning build directory...
rmdir /S /Q build

REM Make HTML files
echo Building HTML files...
sphinx-build -b html source build/html

echo Done!
pause
