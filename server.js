const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    //============================================
    
    //============================================
    // Serve index.html
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    }
    // Serve styles.css
    else if (req.url === '/style.css') {
        fs.readFile(path.join(__dirname, 'style.css'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading styles.css');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(data);
            }
        });
    }
    // Serve index.js
    else if (req.url === '/index.js') {
        fs.readFile(path.join(__dirname, 'index.js'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.js');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end(data);
            }
        });
    }
    else if (req.url === '/file.json') {
        fs.readFile(path.join(__dirname, 'file.json'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading file.json');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            }
        });
    }
    // Serve .txt file
    else if (req.url === '/file.txt') {
        fs.readFile(path.join(__dirname, 'file.txt'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading file.txt');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(data);
            }
        });
    }
    else if (req.method === 'POST' && req.url === '/write-to-file') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const matrixData = JSON.parse(body).data;
            fs.writeFile('file.txt', matrixData, (err) => {
                if (err) {
                    console.error('Error writing Matrix to file:', err);
                    res.writeHead(500);
                    res.end('Error writing Matrix to file');
                    return;
                }
                console.log('Matrix written to file successfully');
                res.writeHead(200);
                res.end('Matrix written to file');
            });
        });
    }
    
    // Serve 404 page for other URLs
    else {
        res.writeHead(404);
        res.end('Page not found');
    }
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
