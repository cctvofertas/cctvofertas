const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const projectDir = path.resolve(__dirname, '..', '..', '..');
const productsPath = path.join(projectDir, 'src', 'data', 'products.json');
const tempUploadsPath = path.join(projectDir, 'src', 'assets', 'temp_uploads');

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/' || req.url === '/index.html') {
        const htmlPath = path.join(__dirname, 'index.html');
        if (fs.existsSync(htmlPath)) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(fs.readFileSync(htmlPath, 'utf8'));
        } else {
            res.writeHead(404);
            res.end('index.html not found');
        }
        return;
    }

    if (req.url === '/api/data' && req.method === 'GET') {
        try {
            const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
            const images = fs.readdirSync(tempUploadsPath).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ products, images }));
        } catch(e) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: e.message }));
        }
        return;
    }

    if (req.url === '/api/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { productId, newImage } = JSON.parse(body);
                const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
                
                // If grouping assigned array of product ids
                if (Array.isArray(productId)) {
                    products.forEach(p => {
                        if (productId.includes(p.name)) {
                            p.image = `src/assets/temp_uploads/${newImage}`;
                        }
                    });
                } else {
                    const idx = products.findIndex(p => p.name === productId);
                    if (idx > -1) {
                        products[idx].image = `src/assets/temp_uploads/${newImage}`;
                    }
                }
                
                fs.writeFileSync(productsPath, JSON.stringify(products, null, 4), 'utf8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch(e) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
    }
    
    // Serve static files dynamically for images
    if (req.url.startsWith('/src/assets/')) {
        const filePath = path.join(projectDir, req.url);
        if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath);
            const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
            res.writeHead(200, { 'Content-Type': mime });
            res.end(fs.readFileSync(filePath));
        } else {
            res.writeHead(404);
            res.end('Not found');
        }
        return;
    }

    res.writeHead(404);
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log(`Mapping Tool Server running at http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to stop.`);
});
