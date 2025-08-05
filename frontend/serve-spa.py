#!/usr/bin/env python3
"""
Simple HTTP server for serving Single Page Applications (SPAs)
Handles client-side routing by serving index.html for all non-file routes
"""

import os
import sys
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path

class SPAHTTPRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='dist', **kwargs)
    
    def do_GET(self):
        # Get the requested path
        path = self.path.split('?')[0]  # Remove query parameters
        
        # Build the full file path
        file_path = Path('dist') / path.lstrip('/')
        
        # List of file extensions to serve as-is
        static_extensions = {'.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', 
                             '.woff', '.woff2', '.ttf', '.eot', '.json', '.map', '.txt'}
        
        # Check if the path has a file extension
        has_extension = any(path.endswith(ext) for ext in static_extensions)
        
        # If the file exists, serve it normally
        if file_path.exists() and file_path.is_file():
            super().do_GET()
        # If it has an extension but doesn't exist, return 404
        elif has_extension:
            self.send_error(404, "File not found")
        # Otherwise, serve index.html for client-side routing
        else:
            self.path = '/index.html'
            super().do_GET()

def run(port=8081):
    server_address = ('', port)
    httpd = HTTPServer(server_address, SPAHTTPRequestHandler)
    print(f"🚀 SPA Server running at http://localhost:{port}")
    print("📁 Serving files from: ./dist")
    print("🔄 Client-side routing enabled")
    print("Press Ctrl+C to stop")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n⏹️  Server stopped")
        httpd.shutdown()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8081
    run(port)