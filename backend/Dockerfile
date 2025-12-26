# Use Python 3.11 slim image (Essentia doesn't support 3.12 yet)
FROM python:3.11-slim

# Install system dependencies including build tools for Essentia
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    gcc \
    g++ \
    gfortran \
    libopenblas-dev \
    curl \
    make \
    cmake \
    pkg-config \
    libfftw3-dev \
    libavcodec-dev \
    libavformat-dev \
    libavutil-dev \
    libswresample-dev \
    libsamplerate0-dev \
    libtag1-dev \
    libyaml-dev \
    libchromaprint-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Railway will set PORT env variable)
EXPOSE 8000

# Start command
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
