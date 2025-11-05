# Backend + PostgreSQL Unified Dockerfile
# Use Ubuntu base image for easier PostgreSQL setup
FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Update Node.js to v20
RUN npm install -g n && n 20 && hash -r

# Create app directory
WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ .
RUN npm run build

# Create startup script that requires managed PostgreSQL
RUN cat <<'EOF' > /startup.sh
#!/bin/bash
set -e

if [ -z "${DATABASE_URL}" ]; then
  echo "❌ DATABASE_URL is not set. Please configure a managed PostgreSQL instance."
  exit 1
fi

export NODE_ENV="${NODE_ENV:-production}"
export PORT="${PORT:-5001}"

cd /app
exec node dist/index.js
EOF

RUN chmod +x /startup.sh

# Expose port
EXPOSE 5001

# Start the application
CMD ["/startup.sh"]
