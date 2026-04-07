const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'src', 'data', 'products.json');
const uploadsPath = path.join(__dirname, 'src', 'assets', 'temp_uploads');
const destPath = path.join(__dirname, 'src', 'assets', 'images', 'products');

// Ensure destination exists
if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
}

// Read products
const productsStr = fs.readFileSync(productsPath, 'utf-8');
const products = JSON.parse(productsStr);

// Read uploaded images
const files = fs.readdirSync(uploadsPath).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));

function normalize(str) {
    if (!str) return '';
    return str.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9]/g, ''); // remove non-alphanumeric
}

let matchedCount = 0;
let updatedProducts = 0;

for (const file of files) {
    const fileNameWithoutExt = path.parse(file).name;
    const normFile = normalize(fileNameWithoutExt);
    
    // Find matching product
    let bestMatch = null;
    let longestMatchLen = 0;

    for (const p of products) {
        const normName = normalize(p.name);
        
        // Exact match
        if (normName === normFile) {
            bestMatch = p;
            break;
        }
        
        // Starts with or includes
        if (normName.includes(normFile) || normFile.includes(normName)) {
            // Pick longest product name match
            if (normName.length > longestMatchLen) {
                bestMatch = p;
                longestMatchLen = normName.length;
            }
        }
    }
    
    if (bestMatch) {
        matchedCount++;
        // Define new path
        const newFileName = fileNameWithoutExt.toLowerCase().replace(/[^a-z0-9]+/g, '-') + path.parse(file).ext;
        const newRelPath = 'src/assets/images/products/' + newFileName;
        const newAbsPath = path.join(destPath, newFileName);
        const oldAbsPath = path.join(uploadsPath, file);
        
        // Copy file if it doesn't exist already
        if (!fs.existsSync(newAbsPath)) {
            fs.copyFileSync(oldAbsPath, newAbsPath);
        }
        
        // Update product
        if (bestMatch.image !== newRelPath) {
            bestMatch.image = newRelPath;
            updatedProducts++;
        }
    } else {
        console.log(`NO MATCH: ${file}`);
    }
}

console.log(`\nMatched images: ${matchedCount} / ${files.length}`);
console.log(`Products updated: ${updatedProducts}`);

// Write back to products.json
fs.writeFileSync(productsPath, JSON.stringify(products, null, 4));
console.log("products.json updated.");
