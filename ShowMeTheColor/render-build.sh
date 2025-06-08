#!/usr/bin/env bash
# Build script for Render - installs system dependencies for dlib

set -e

echo "Installing system dependencies for dlib..."
apt-get update -qq
apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    python3-dev

echo "Installing Python dependencies..."
cd ShowMeTheColor
pip install --upgrade pip setuptools wheel
pip install cmake
pip install dlib --no-cache-dir
pip install -r requirements.txt

echo "Build completed successfully!"