#!/bin/bash

# Initialize PCA-HIJAB Database Tables
# This script creates all required tables in your PostgreSQL database

if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set"
    echo "Please set it to your Render PostgreSQL connection string"
    echo "Example: export DATABASE_URL='postgresql://user:password@host:port/dbname'"
    exit 1
fi

echo "Initializing database tables..."
echo "Using database: $DATABASE_URL"

# Run the SQL script
psql "$DATABASE_URL" < ../src/db/init-fixed.sql

if [ $? -eq 0 ]; then
    echo "✅ Database tables created successfully!"
else
    echo "❌ Error creating database tables"
    exit 1
fi