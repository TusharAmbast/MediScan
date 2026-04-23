# ── MediScan Backend Dockerfile ───────────────────────────────
# Optimized for HuggingFace Spaces deployment
# HuggingFace Spaces requires the app to listen on port 7860

FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Install system-level dependencies required by OpenCV and EasyOCR
# These are C libraries that Python packages need under the hood
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (Docker caches this layer)
# If only your code changes (not requirements), Docker skips reinstalling packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# HuggingFace Spaces listens on port 7860
EXPOSE 7860

# Start the FastAPI server
# 0.0.0.0 means "listen on all network interfaces" (required for containers)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]