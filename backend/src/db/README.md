# Database Setup and Migration

This directory contains the database schema and migration files for the PCA-HIJAB backend.

## Files

- `schema.sql` - Complete database schema with all tables, indexes, and triggers
- `add_session_columns_migration.sql` - Migration to add missing columns to existing databases
- `run_migration.js` - Node.js script to run the migration
- `index.ts` - Database interface with in-memory fallback
- `postgres.ts` - PostgreSQL implementation

## Usage

### For New Databases

If you're setting up a fresh database, simply run the complete schema:

```bash
# Connect to your PostgreSQL database and run:
psql $DATABASE_URL -f src/db/schema.sql
```

### For Existing Databases (Migration)

If you have an existing database that needs the missing `uploaded_image_url` and `analysis_result` columns:

```bash
# Set your DATABASE_URL environment variable
export DATABASE_URL="your_postgres_connection_string"

# Run the migration
cd backend
node src/db/run_migration.js
```

Or run the migration SQL directly:

```bash
psql $DATABASE_URL -f src/db/add_session_columns_migration.sql
```

## Database Schema

### Sessions Table
- `id` (VARCHAR(50)) - Primary key
- `instagram_id` (VARCHAR(30)) - Instagram user ID
- `uploaded_image_url` (TEXT) - URL of uploaded image
- `analysis_result` (JSONB) - Personal color analysis result
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp (auto-updated)

### Recommendations Table
- `id` (VARCHAR(50)) - Primary key
- `session_id` (VARCHAR(50)) - Foreign key to sessions
- `instagram_id` (VARCHAR(30)) - Instagram user ID
- `personal_color_result` (JSONB) - Color analysis data
- `user_preferences` (JSONB) - User preferences
- `uploaded_image_url` (TEXT) - URL of uploaded image
- `status` (VARCHAR(20)) - Status: pending, processing, completed
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp (auto-updated)

## Environment Variables

Make sure to set the following environment variable:

```bash
DATABASE_URL="postgresql://username:password@host:port/database"
```

If `DATABASE_URL` is not set, the application will fall back to in-memory storage for development.