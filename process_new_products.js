const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'src', 'data', 'products.json');
const uploadsPath = path.join(__dirname, 'src', 'assets', 'temp_uploads');
const destPath = path.join(__dirname, 'src', 'assets', 'images', 'products');

const productsStr = fs.readFileSync(productsPath, 'utf-8');
const products = JSON.parse(productsStr);

const uploadFiles = fs.readdirSync(uploadsPath).filter(f => f.match(/\.(png|jpg|jpeg|webp)$/i));

// Some basic keyword matching for brands and categories
function getBrand(name) {
    const lName = name.toLowerCase();
    if (lName.includes('hikvision')) return 'hikvision';
    if (lName.includes('dahua')) return 'dahua';
    if (lName.includes('ezviz')) return 'ezviz';
    if (lName.includes('imou')) return 'imou';
    if (lName.includes('uniview')) return 'uniview';
    if (lName.includes('lexa')) return 'lexa';
    if (lName.includes('kingston')) return 'kingston';
    if (lName.includes('tenda')) return 'tenda';
    if (lName.includes('logitech')) return 'logitech';
    if (lName.includes('genius')) return 'genius';
    if (lName.includes('xprinter')) return 'xprinter';
    return 'other';
}

function getCategory(name) {
    const lName = name.toLowerCase();
    if (lName.includes('cámara') || lName.includes('camara')) return 'cámaras';
    if (lName.includes('nvr') || lName.includes('dvr')) return 'grabadores';
    if (lName.includes('kit') && (lName.includes('cámara') || lName.includes('camara'))) return 'kits';
    if (lName.includes('cerradura') || lName.includes('bombillo') || lName.includes('solar')) return 'smarthome';
    if (lName.includes('teclado') || lName.includes('mouse') || lName.includes('pad')) return 'perifericos';
    if (lName.includes('impresora') || lName.includes('lector') || lName.includes('cajon')) return 'pos';
    if (lName.includes('memoria') || lName.includes('disco')) return 'almacenamiento';
    return 'accesorios';
}

function getTech(name) {
    const lName = name.toLowerCase();
    if (lName.includes('wifi') || lName.includes('wi-fi') || lName.includes('bluetooth') || lName.includes('inalambrico')) return 'wifi';
    if (lName.includes('ip') || lName.includes('red') || lName.includes('rj45')) return 'ip';
    if (lName.includes('analogo') || lName.includes('ahd') || lName.includes('tvi')) return 'analoga';
    return 'other';
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

let addedCount = 0;

for (const file of uploadFiles) {
    const parsed = path.parse(file);
    let originalName = parsed.name; // e.g. "CABLE HDMI VERSIÓN 2.0 - 4K"
    
    // Check if it already exists
    const exists = products.find(p => p.image.includes(encodeURI(file)) || p.name.toLowerCase() === originalName.toLowerCase());
    if (exists) {
        // Just move the file and update the image
        const safeName = originalName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + parsed.ext;
        exists.image = 'src/assets/images/products/' + safeName;
        fs.renameSync(path.join(uploadsPath, file), path.join(destPath, safeName));
        continue;
    }

    // Capitalize properly: "Cable Hdmi Versión 2.0 - 4k"
    let cleanName = originalName.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    cleanName = toTitleCase(cleanName);

    const category = getCategory(cleanName);
    const brand = getBrand(cleanName);
    const tech = getTech(cleanName);

    // Create a safe filename 
    const safeFilename = originalName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + parsed.ext;
    const newImagePath = path.join(destPath, safeFilename);
    const relativeImagePath = 'src/assets/images/products/' + safeFilename;

    // Move file
    fs.renameSync(path.join(uploadsPath, file), newImagePath);

    let priceFromDb = 0;
    // Guess description
    let description = `${cleanName}. Ideal para complementar tus sistemas de tecnología y seguridad.`;
    if (category === 'cámaras') description = `Cámara de seguridad ${cleanName}. Alta resolución y fiabilidad para tu tranquilidad.`;
    if (category === 'accesorios' && cleanName.toLowerCase().includes('cable')) description = `${cleanName} de alta resistencia y durabilidad garantizada.`;
    
    const newProduct = {
        name: cleanName,
        price: 0,
        image: relativeImagePath,
        description: description,
        category: category,
        brand: brand,
        tech: tech,
        whatsappMessage: `Hola CCTV OFERTAS, estoy interesado en el producto: ${cleanName}`
    };

    products.push(newProduct);
    addedCount++;
}

fs.writeFileSync(productsPath, JSON.stringify(products, null, 4));
console.log(`Added ${addedCount} new products from images.`);

