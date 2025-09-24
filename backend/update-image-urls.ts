import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : false
});

async function updateImageUrls() {
  try {
    console.log('Connecting to database...');
    await pool.query('SELECT NOW()');
    console.log('Connected successfully');
    
    // Update all image URLs to use .svg extension
    const updateQuery = `
      UPDATE products 
      SET thumbnail_url = REPLACE(thumbnail_url, '.jpg', '.svg'),
          updated_at = CURRENT_TIMESTAMP
      WHERE thumbnail_url LIKE '%.jpg'
    `;
    
    const result = await pool.query(updateQuery);
    console.log(`Updated ${result.rowCount} product image URLs to use .svg extension`);
    
    // Verify the update
    const checkQuery = `
      SELECT name, thumbnail_url 
      FROM products 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    
    const checkResult = await pool.query(checkQuery);
    console.log('\nSample updated URLs:');
    checkResult.rows.forEach(row => {
      console.log(`- ${row.name}: ${row.thumbnail_url}`);
    });
    
  } catch (error) {
    console.error('Error updating image URLs:', error);
  } finally {
    await pool.end();
  }
}

updateImageUrls();