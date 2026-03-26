const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..', '..');
const productsJsonPath = path.join(projectDir, 'src', 'data', 'products.json');
const imagesDir = path.join(projectDir, 'src', 'assets', 'images', 'products');

// Read existing products
const data = fs.readFileSync(productsJsonPath, 'utf8');
let products = JSON.parse(data);

// Read available local images
const availableImages = fs.readdirSync(imagesDir).map(file => ({
    file,
    lower: file.toLowerCase(),
    path: `src/assets/images/products/${file}`
}));

function slugify(text) {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function findBestLocalImage(product) {
    // 1. Try exact matches on slugified name or parts of it
    const n = slugify(product.name);
    const parts = n.split('-');
    
    // First specific searches
    for (const img of availableImages) {
        if (img.lower.includes(n)) {
            return img.path;
        }
    }
    
    // 2. Keyword matching for common similarities (like 1TB/2TB/4TB disco duro)
    const keywords = ['disco-duro', 'dvr', 'nvr', 'cctv-kit'];
    for (const kw of keywords) {
        if (n.includes(kw)) {
            // find image with that kw
            const match = availableImages.find(i => i.lower.includes(kw));
            if (match) return match.path;
        }
    }
    
    // 3. Find by important generic words in the name
    const genericWords = parts.filter(p => p.length > 3 && p !== "camara" && p !== "para");
    for (const gw of genericWords) {
        const match = availableImages.find(i => i.lower.includes(gw) && !i.lower.includes('fallback'));
        if (match) return match.path;
    }
    
    // 4. Default to standard types
    if (n.includes('bala') || n.includes('bullet') || n.includes('exterior')) return 'src/assets/images/products/bullet_camera_fallback.png';
    if (n.includes('domo') || n.includes('dome') || n.includes('interior')) return 'src/assets/images/products/dome_camera_fallback.png';
    if (n.includes('ptz') || n.includes('robotizada') || n.includes('movimiento')) return 'src/assets/images/products/ptz_camera_fallback.png';
    if (n.includes('dvr') || n.includes('nvr') || n.includes('grabador')) return 'src/assets/images/products/dvr_nvr_fallback.png';
    if (n.includes('disco') || n.includes('hdd') || n.includes('purple')) return 'src/assets/images/products/hard_drive_fallback.png';
    if (n.includes('kit') || n.includes('combo')) return 'src/assets/images/products/kit_fallback.png';
    
    // If it's a camera but no specific type found
    if (n.includes('camara')) return 'src/assets/images/products/bullet_camera_fallback.png';
    
    // 5. Fallback generalized by category if missing
    return 'src/assets/images/products/accessory_fallback.png';
}

const cleanedProducts = [];
const seenNames = new Set();

for (const p of products) {
    // Basic normalization
    if (!p.name) continue;
    p.name = p.name.trim();
    if (seenNames.has(p.name)) continue; // ignore duplicates
    seenNames.add(p.name);
    
    p.description = p.description ? p.description.trim() : '';
    p.category = p.category ? p.category.trim().toLowerCase() : 'other';
    p.brand = p.brand ? p.brand.trim().toLowerCase() : 'other';
    p.tech = p.tech ? p.tech.trim().toLowerCase() : 'other';
    
    if (!p.whatsappMessage) {
        p.whatsappMessage = `Hola CCTV OFERTAS, estoy interesado en el producto: ${p.name}`;
    }
    
    // Image Validation & Reuse logic
    let currentImage = p.image || '';
    
    // If it's external, we wipe it so we can find a local match or fallback
    if (currentImage.startsWith('http')) {
        currentImage = '';
    }
    
    // Check if the currentImage points to a valid file
    if (currentImage) {
        const imgName = path.basename(currentImage).toLowerCase();
        const exists = availableImages.some(img => img.lower === imgName);
        if (!exists) {
            currentImage = ''; // invalid local path
        }
    }
    
    // Assign new local image mapping if missing
    if (!currentImage) {
        currentImage = findBestLocalImage(p);
        p.image = currentImage;
    }
    
    cleanedProducts.push(p);
}

fs.writeFileSync(productsJsonPath, JSON.stringify(cleanedProducts, null, 4), 'utf8');

console.log(`Processed ${cleanedProducts.length} products successfully.`);
