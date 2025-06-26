@echo off
echo.
echo ================================
echo  DIU Exam Routine Processor
echo ================================
echo.
echo Processing exam data...
echo.

cd /d "%~dp0"
python process_exam_data.py

echo.
echo ================================
echo Processing complete!
echo ================================
echo.
pause
