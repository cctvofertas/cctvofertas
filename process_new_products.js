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
    // For this specific batch, everything is Uniview as confirmed by user
    if (lName.includes('uniview') || lName.includes('unv')) return 'uniview';
    
    if (lName.includes('hikvision')) return 'hikvision';
    if (lName.includes('dahua')) return 'dahua';
    if (lName.includes('ezviz')) return 'ezviz';
    if (lName.includes('imou')) return 'imou';
    if (lName.includes('lexa')) return 'lexa';
    if (lName.includes('kingston')) return 'kingston';
    if (lName.includes('tenda')) return 'tenda';
    if (lName.includes('logitech')) return 'logitech';
    if (lName.includes('genius')) return 'genius';
    if (lName.includes('xprinter')) return 'xprinter';
    
    // Default to uniview for this batch
    return 'uniview';
}

function getCategory(name) {
    const lName = name.toLowerCase();
    
    if (lName.includes('kit')) return 'kits';
    if (lName.includes('cámara') || lName.includes('camara') || lName.includes('bullet') || lName.includes('turret') || lName.includes('ptz') || lName.includes('domo') || lName.includes('eyeball') || lName.includes('omniview') || lName.includes('colorhunter')) return 'cameras';
    if (lName.includes('nvr') || lName.includes('dvr') || lName.includes('grabador') || lName.includes('videograbador') || lName.includes('grabadora')) return 'recorders';
    if (lName.includes('monitor') || lName.includes('pantalla')) return 'monitores';
    if (lName.includes('switch') || lName.includes('conmutador') || lName.includes('poe') || lName.includes('sfp') || lName.includes('hub')) return 'networking';
    if (lName.includes('cerradora') || lName.includes('cerradura') || lName.includes('torniquete') || lName.includes('lector') || lName.includes('terminal') || lName.includes('control de acceso') || lName.includes('credencial') || lName.includes('mifare')) return 'control-acceso';
    if (lName.includes('portero') || lName.includes('intercom') || lName.includes('estación de puerta') || lName.includes('estacion interior') || lName.includes('videoportero')) return 'intercom';
    if (lName.includes('memoria') || lName.includes('disco') || lName.includes('tarjeta tf') || lName.includes('micro sd') || lName.includes('sd card')) return 'almacenamiento';
    if (lName.includes('smart') || lName.includes('bombillo') || lName.includes('solar')) return 'smarthome';
    
    return 'accessories';
}

function getTech(name) {
    const lName = name.toLowerCase();
    if (lName.includes('wifi') || lName.includes('wi-fi') || lName.includes('bluetooth') || lName.includes('inalambrico')) return 'wifi';
    if (lName.includes('ip') || lName.includes('red') || lName.includes('network') || lName.includes('rj45')) return 'ip';
    if (lName.includes('analogo') || lName.includes('analógica') || lName.includes('ahd') || lName.includes('tvi') || lName.includes('hdtvi') || lName.includes('hdcvi')) return 'analoga';
    return 'other';
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

let addedCount = 0;
let newProducts = [];

for (const file of uploadFiles) {
    const parsed = path.parse(file);
    let originalName = parsed.name; 
    
    // Check if it already exists
    const exists = products.find(p => p.image.includes(encodeURI(file)) || p.name.toLowerCase() === originalName.toLowerCase());
    if (exists) {
        // Just move the file and update the image
        const safeName = originalName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + parsed.ext;
        exists.image = 'src/assets/images/products/' + safeName;
        fs.renameSync(path.join(uploadsPath, file), path.join(destPath, safeName));
        continue;
    }

    // Capitalize properly
    let cleanName = originalName.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    cleanName = toTitleCase(cleanName);

    const brand = getBrand(cleanName);
    const category = getCategory(cleanName);
    const tech = getTech(cleanName);

    // Create a safe filename 
    const safeFilename = originalName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + parsed.ext;
    const newImagePath = path.join(destPath, safeFilename);
    const relativeImagePath = 'src/assets/images/products/' + safeFilename;

    // Move file
    fs.renameSync(path.join(uploadsPath, file), newImagePath);

    // Guess description
    let description = `${cleanName}. Tecnología de vanguardia Uniview para soluciones profesionales.`;
    if (category === 'cameras') description = `Cámara de seguridad ${brand.toUpperCase()} ${cleanName}. Alta definición y visión nocturna avanzada.`;
    if (category === 'networking') description = `Equipo de red ${cleanName}. Solución robusta para sistemas de videovigilancia IP.`;
    if (category === 'recorders') description = `Grabador ${brand.toUpperCase()} ${cleanName}. Gestión eficiente de video y almacenamiento seguro.`;
    if (category === 'monitores') description = `Monitor Profesional ${cleanName}. Diseñado para operación continua 24/7.`;
    
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
    newProducts.push(newProduct);
    addedCount++;
}

// Write back to products.json
fs.writeFileSync(productsPath, JSON.stringify(products, null, 4));
console.log(`✅ products.json actualizado. Se agregaron ${newProducts.length} productos.`);

// --- AUTOMATIC VERSION BUMPING ---
const configPath = path.join(__dirname, 'src', 'config', 'site-config.js');
const swPath = path.join(__dirname, 'sw.js');

try {
    // 1. Update site-config.js version
    let configContent = fs.readFileSync(configPath, 'utf8');
    const versionMatch = configContent.match(/version:\s*"(\d+)\.(\d+)\.(\d+)"/);
    
    if (versionMatch) {
        const major = parseInt(versionMatch[1]);
        const minor = parseInt(versionMatch[2]);
        const patch = parseInt(versionMatch[3]) + 1;
        const newVersion = `${major}.${minor}.${patch}`;
        
        configContent = configContent.replace(/version:\s*".*?"/, `version: "${newVersion}"`);
        fs.writeFileSync(configPath, configContent);
        console.log(`⏲️ Versión del sitio incrementada a: ${newVersion}`);

        // 2. Update sw.js CACHE_NAME
        if (fs.existsSync(swPath)) {
            let swContent = fs.readFileSync(swPath, 'utf8');
            swContent = swContent.replace(/const CACHE_NAME = '.*?';/, `const CACHE_NAME = 'cctv-ofertas-v${newVersion}';`);
            fs.writeFileSync(swPath, swContent);
            console.log(`\uD83D\uDEE1\uFE0F Service Worker actualizado a la versi\u00F3n: v${newVersion}`);
        }
    }
} catch (error) {
    console.error('⚠️ Error al actualizar la versión:', error.message);
}

console.log('\n🎉 ¡Proceso completado exitosamente!');
console.log('Ahora puedes subir los cambios. Los navegadores de los clientes se actualizarán automáticamente.');
