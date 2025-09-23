# Backend + PostgreSQL Unified Dockerfile
# Use Ubuntu base image for easier PostgreSQL setup
FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    postgresql-14 \
    postgresql-contrib-14 \
    nodejs \
    npm \
    supervisor \
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

# Create PostgreSQL setup script
RUN mkdir -p /docker-entrypoint-initdb.d
COPY backend/init-db.sql /docker-entrypoint-initdb.d/

# Create startup script
RUN echo '#!/bin/bash' > /startup.sh && \
    echo 'set -e' >> /startup.sh && \
    echo '' >> /startup.sh && \
    echo '# Start PostgreSQL' >> /startup.sh && \
    echo 'service postgresql start' >> /startup.sh && \
    echo '' >> /startup.sh && \
    echo '# Wait for PostgreSQL to be ready' >> /startup.sh && \
    echo 'echo "Waiting for PostgreSQL to start..."' >> /startup.sh && \
    echo 'until pg_isready -h localhost -p 5432; do' >> /startup.sh && \
    echo '  echo "Waiting for PostgreSQL..."' >> /startup.sh && \
    echo '  sleep 1' >> /startup.sh && \
    echo 'done' >> /startup.sh && \
    echo '' >> /startup.sh && \
    echo '# Setup database' >> /startup.sh && \
    echo 'su postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname = '\''pca_hijab'\''\" | grep -q 1 || createdb pca_hijab"' >> /startup.sh && \
    echo 'su postgres -c "psql -c \"DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '\''pca_user'\'') THEN CREATE USER pca_user WITH PASSWORD '\''pca_password'\''; END IF; END \$\$;\""' >> /startup.sh && \
    echo 'su postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE pca_hijab TO pca_user;\""' >> /startup.sh && \
    echo 'su postgres -c "psql -c \"ALTER DATABASE pca_hijab OWNER TO pca_user;\""' >> /startup.sh && \
    echo '' >> /startup.sh && \
    echo '# Initialize schema if exists' >> /startup.sh && \
    echo 'if [ -f /docker-entrypoint-initdb.d/init-db.sql ]; then' >> /startup.sh && \
    echo '    su postgres -c "PGPASSWORD=pca_password psql -U pca_user -h localhost -d pca_hijab -f /docker-entrypoint-initdb.d/init-db.sql" || echo "Schema initialization skipped"' >> /startup.sh && \
    echo 'fi' >> /startup.sh && \
    echo '' >> /startup.sh && \
    echo '# Configure PostgreSQL for local connections' >> /startup.sh && \
    echo 'su postgres -c "psql -c \"ALTER USER pca_user WITH SUPERUSER;\""' >> /startup.sh && \
    echo '' >> /startup.sh && \
    echo '# Export environment variables' >> /startup.sh && \
    echo 'export DATABASE_URL="postgresql://pca_user:pca_password@localhost:5432/pca_hijab"' >> /startup.sh && \
    echo 'export NODE_ENV="production"' >> /startup.sh && \
    echo 'export PORT=${PORT:-5001}' >> /startup.sh && \
    echo '' >> /startup.sh && \
    echo '# Start Node.js backend' >> /startup.sh && \
    echo 'cd /app' >> /startup.sh && \
    echo 'exec node dist/index.js' >> /startup.sh

RUN chmod +x /startup.sh

# Expose port
EXPOSE 5001

# Start the application
CMD ["/startup.sh"]