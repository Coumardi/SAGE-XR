
@echo off
REM Navigate to the Sphinx project directory
cd path\to\your\sphinx\project

REM Clean the build directory
echo Cleaning build directory...
rmdir /S /Q build

REM Make HTML files for SRS
echo Building HTML files for SRS...
sphinx-build -b html source build/srs -t srs

echo Done!
pause

