# ── MediScan Backend Dockerfile ───────────────────────────────
# Optimized for Railway deployment (CPU-only to save space)

FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Install system-level dependencies required by OpenCV and EasyOCR
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# 1. Dummy variable to force Docker to bust the cache (Change this number if you ever need to clear cache again)
ENV CACHE_BUSTER=1

# PRE-INSTALL CPU-only PyTorch to stay under the 4GB limit
# Add "numpy<2.0.0" right in this command
RUN pip install --no-cache-dir "numpy<2.0.0" torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Start the FastAPI server using Railway's dynamic port variable
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port $PORT"]