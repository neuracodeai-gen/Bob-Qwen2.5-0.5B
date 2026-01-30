@echo off
echo === Bob Chatbot Setup ===

REM Step 0: Check Python
where python >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Python not found! Please install Python 3.12+ from https://www.python.org/downloads/
    pause
    exit /b
)

REM Step 1: Install Ollama automatically via winget (Windows 10/11)
echo Checking Ollama...
where ollama >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Ollama not found. Installing Ollama automatically...
    REM Use winget to install Ollama
    winget install Ollama.Ollama -e --silent
    IF %ERRORLEVEL% NEQ 0 (
        echo Failed to install Ollama via winget. Please install manually: https://ollama.com
        pause
        exit /b
    )
) ELSE (
    echo Ollama is already installed.
)

REM Step 2: Pull Qwen model
echo Pulling qwen2.5:0.5b model locally...
ollama pull qwen2.5:0.5b
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to pull model. Make sure Ollama is working.
    pause
    exit /b
)

REM Step 3: Install Python dependencies
echo Installing Python packages...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to install Python dependencies.
    pause
    exit /b
)
REM Step 4: Run the chatbot
py app.py

echo Setup complete! You can now run Bob by executing run.bat and then accessing the url: http://127.0.0.1:5000 in You Browser.
pause
