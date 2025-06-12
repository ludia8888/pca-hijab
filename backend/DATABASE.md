# Database Setup Guide

## Database Configuration

The backend supports two database modes:

1. **In-Memory Storage** (Development only)
   - Used when `DATABASE_URL` is not set
   - Data is lost on server restart
   - Suitable for local development and testing

2. **PostgreSQL** (Required for production)
   - Used when `DATABASE_URL` is set
   - Persistent data storage
   - Required when `NODE_ENV=production`

## Development Setup

### Using PostgreSQL Locally

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql

   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Create Database**
   ```bash
   # Access PostgreSQL
   psql postgres

   # Create database and user
   CREATE DATABASE pca_hijab;
   CREATE USER pca_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE pca_hijab TO pca_user;
   \q
   ```

3. **Set Environment Variable**
   ```bash
   # In backend/.env
   DATABASE_URL=postgresql://pca_user:your_password@localhost:5432/pca_hijab
   ```

4. **Initialize Schema**
   ```bash
   # The schema will be automatically created on first run (development only)
   npm run dev
   
   # Or manually run the schema
   psql $DATABASE_URL < src/db/schema.sql
   ```

## Production (Render)

Render provides managed PostgreSQL databases that automatically set the `DATABASE_URL` environment variable.

### Setup on Render

1. **Create PostgreSQL Database**
   - Go to Render Dashboard
   - Click "New +" → "PostgreSQL"
   - Choose region (same as your web service)
   - Select plan (Free tier available)
   - Click "Create Database"

2. **Connect to Web Service**
   - Go to your web service settings
   - Environment → Add Environment Group
   - Select your PostgreSQL database
   - This automatically adds `DATABASE_URL`

3. **Initialize Production Schema**
   - Schema is NOT auto-created in production
   - Use Render's dashboard PSQL tool
   - Run the contents of `src/db/schema.sql`
   - Or use the Render CLI:
     ```bash
     render db:connect
     # Then paste the schema.sql contents
     ```

### Database Schema

```sql
-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    instagram_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recommendations table  
CREATE TABLE IF NOT EXISTS recommendations (
    id VARCHAR(255) PRIMARY KEY,
    session_id VARCHAR(255) REFERENCES sessions(id),
    instagram_id VARCHAR(255) NOT NULL,
    personal_color_result JSONB NOT NULL,
    user_preferences JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_recommendations_created_at ON recommendations(created_at DESC);
CREATE INDEX idx_sessions_instagram_id ON sessions(instagram_id);
```

## Schema Updates

For production schema changes:

1. **Test locally first**
   ```bash
   # Test with local PostgreSQL
   psql $DATABASE_URL < new-schema.sql
   ```

2. **Apply to production**
   - Create a backup first
   - Use Render's maintenance mode
   - Apply changes via PSQL tool
   - Verify with test queries

3. **Future Enhancement**: Consider adding a migration tool like `node-pg-migrate` for version-controlled schema changes.

## Backup and Restore

### Backup
```bash
# Local
pg_dump pca_hijab > backup.sql

# Render (use dashboard or CLI)
render db:backups:create
```

### Restore
```bash
# Local
psql pca_hijab < backup.sql

# Render
render db:backups:restore <backup-id>
```

## Monitoring

- **Local**: Use pgAdmin or TablePlus
- **Render**: Built-in metrics dashboard
- **Queries**: Add logging for slow queries

```typescript
// Query logging is available in development
// Set NODE_ENV=development to see detailed logs

// Monitor slow queries in production:
// - Render Dashboard → Database → Metrics
// - Look for queries > 100ms
// - Check connection pool usage
```

## Troubleshooting

### Common Issues

1. **Connection Failed in Production**
   - Verify `DATABASE_URL` is set correctly
   - Check database is in same region as web service
   - Ensure database is not suspended (free tier limitation)

2. **Schema Not Found**
   - Production does not auto-create schema
   - Manually run schema.sql via PSQL tool
   - Check for migration errors in logs

3. **Performance Issues**
   - Check indexes are created
   - Monitor connection pool size
   - Review slow query logs
   - Consider upgrading from free tier

### Connection Pool Settings

The application uses these default pool settings:
- `max`: 10 connections
- `idleTimeoutMillis`: 30000
- `connectionTimeoutMillis`: 2000

Adjust in `src/db/postgres.ts` if needed based on your plan limits.