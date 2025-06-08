# Database Setup Guide

## Development (Optional)

The backend supports both in-memory storage and PostgreSQL. By default, it uses in-memory storage if `DATABASE_URL` is not set.

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
   # The schema will be automatically created on first run
   npm run dev
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
   ```sql
   -- Connect to database using Render's PSQL command
   -- Run the contents of src/db/schema.sql
   ```

### Database Schema

```sql
-- Sessions table
sessions
├── id (VARCHAR PRIMARY KEY)
├── instagram_id (VARCHAR)
└── created_at (TIMESTAMP)

-- Recommendations table  
recommendations
├── id (VARCHAR PRIMARY KEY)
├── session_id (VARCHAR FK)
├── instagram_id (VARCHAR)
├── personal_color_result (JSONB)
├── user_preferences (JSONB)
├── status (VARCHAR)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## Migrations

For production, use a migration tool like `node-pg-migrate`:

```bash
# Install migration tool
npm install --save-dev node-pg-migrate

# Create migration
npm run migrate create add-recommendations-table

# Run migrations
npm run migrate up
```

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
// Enable query logging in development
const pool = new Pool({
  // ... other config
  log: (msg) => console.log(msg),
});
```