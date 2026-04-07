const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'src', 'data', 'products.json');
const productsStr = fs.readFileSync(productsPath, 'utf-8');
const products = JSON.parse(productsStr);

let filteredProducts = [];
let removedCount = 0;

for (const product of products) {
    if (!product.image) {
        removedCount++;
        continue;
    }
    
    // Check if image is a fallback
    if (product.image.includes('fallback.png') || product.image.includes('fallback.jpg')) {
        removedCount++;
        continue;
    }

    // Check if the image path actually exists on disk
    const absPath = path.join(__dirname, product.image);
    if (!fs.existsSync(absPath)) {
        removedCount++;
        continue;
    }

    // Is a real product with a real image
    filteredProducts.push(product);
}

fs.writeFileSync(productsPath, JSON.stringify(filteredProducts, null, 4));
console.log(`Kept ${filteredProducts.length} products.`);
console.log(`Removed ${removedCount} products without real images.`);
