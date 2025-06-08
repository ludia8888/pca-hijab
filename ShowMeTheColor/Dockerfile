# Multi-stage build for smaller final image
FROM python:3.9 AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    libboost-all-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
WORKDIR /build
COPY ShowMeTheColor/requirements.txt .
RUN pip install --upgrade pip setuptools wheel && \
    pip install cmake && \
    pip install dlib==19.24.2 --verbose && \
    pip install -r requirements.txt

# Final stage
FROM python:3.9-slim

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    libopenblas0 \
    liblapack3 \
    libx11-6 \
    libgtk-3-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application
WORKDIR /app
COPY ShowMeTheColor/ .

# Set environment
ENV PYTHONPATH=/app/src:$PYTHONPATH
ENV PORT=8000

# Run
CMD ["sh", "-c", "cd src && uvicorn api:app --host 0.0.0.0 --port $PORT"]