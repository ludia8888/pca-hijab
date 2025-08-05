const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8081;
const DIST_DIR = path.join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'font/eot'
};

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  let extname = path.extname(filePath).toLowerCase();
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    // If file doesn't exist and has no extension, serve index.html (SPA routing)
    if (err && !extname) {
      filePath = path.join(DIST_DIR, 'index.html');
      extname = '.html'; // Important: set extension for Content-Type
    }
    
    // Read and serve the file
    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('File not found');
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Server error: ' + error.code);
        }
      } else {
        // Use the corrected extension for Content-Type
        const finalExtname = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[finalExtname] || 'application/octet-stream';
        res.writeHead(200, { 
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
        res.end(content, 'utf-8');
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 SPA Server running at http://localhost:${PORT}`);
  console.log('📁 Serving files from: ./dist');
  console.log('🔄 Client-side routing enabled');
  console.log('Press Ctrl+C to stop');
});