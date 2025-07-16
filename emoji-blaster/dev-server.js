const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

// Enhanced hot reload script with better error handling
const hotReloadScript = `
<script>
(function() {
    let lastModified = {};
    let isReloading = false;
    
    function checkForUpdates() {
        if (isReloading) return;
        
        const filesToWatch = ['/', '/script.js', '/style.css'];
        
        filesToWatch.forEach(file => {
            fetch(file + '?check=' + Date.now(), { method: 'HEAD' })
                .then(response => {
                    const modified = response.headers.get('Last-Modified');
                    if (lastModified[file] && lastModified[file] !== modified) {
                        console.log('🔄 Hot reload: File changed:', file);
                        isReloading = true;
                        
                        // Flash indicator
                        const indicator = document.createElement('div');
                        indicator.style.cssText = \`
                            position: fixed; top: 10px; right: 10px; 
                            background: #4CAF50; color: white; 
                            padding: 8px 12px; border-radius: 4px; 
                            font-family: monospace; font-size: 12px;
                            z-index: 10000; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        \`;
                        indicator.textContent = '🔄 RELOADING...';
                        document.body.appendChild(indicator);
                        
                        setTimeout(() => window.location.reload(), 100);
                        return;
                    }
                    lastModified[file] = modified;
                })
                .catch(err => {
                    if (!isReloading) {
                        console.log('⚠️  Hot reload check failed:', err.message);
                    }
                });
        });
    }
    
    // Check for changes every 500ms
    setInterval(checkForUpdates, 500);
    
    // Initial check
    setTimeout(checkForUpdates, 1000);
    
    console.log('🔥 Hot reload enabled - watching for changes...');
})();
</script>
`;

function serveFile(filePath, res) {
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'text/plain';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
            }
            return;
        }
        
        const stats = fs.statSync(filePath);
        res.writeHead(200, { 
            'Content-Type': contentType,
            'Last-Modified': stats.mtime.toUTCString()
        });
        
        // Inject hot reload script into HTML
        if (ext === '.html') {
            const html = content.toString();
            const modifiedHtml = html.replace('</body>', hotReloadScript + '</body>');
            res.end(modifiedHtml);
        } else {
            res.end(content);
        }
    });
}

// Function to find an available port
function findAvailablePort(startPort = 3000) {
    return new Promise((resolve, reject) => {
        const server = http.createServer();
        
        server.listen(startPort, () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        });
        
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                // Port is in use, try the next one
                findAvailablePort(startPort + 1).then(resolve).catch(reject);
            } else {
                reject(err);
            }
        });
    });
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;
    
    // Handle root path
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    const filePath = path.join(__dirname, pathname);
    
    // Security check - prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }
        
        serveFile(filePath, res);
    });
});

// Start server with automatic port detection
const preferredPort = process.env.PORT || 3000;
findAvailablePort(preferredPort).then(port => {
    server.listen(port, () => {
        console.log(`
🚀 Emoji Blaster Development Server
📍 Server running at: http://localhost:${port}
🔥 Hot reload enabled
⚡ Ready for development!

${port !== preferredPort ? `⚠️  Port ${preferredPort} was in use, using port ${port} instead` : ''}

Press Ctrl+C to stop
        `);
        
        // Auto-open browser (optional)
        const open = require('child_process').exec;
        open(`open http://localhost:${port}`, (err) => {
            // Ignore errors - not all systems have 'open' command
        });
    });
}).catch(err => {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
}); 