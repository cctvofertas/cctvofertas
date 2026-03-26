const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..', '..');
const productsPath = path.join(projectDir, 'src', 'data', 'products.json');
const reportPath = path.join(projectDir, 'src', 'data', 'error_report.json');

const VALID_CATEGORIES = ['cámaras', 'grabadores', 'smarthome', 'accesorios', 'kits', 'redes'];

// Helper to normalize Spanish strings
function normalizeSpanishName(name) {
    if (!name) return '';
    let normalized = name.trim();
    // basic capitalization of words
    normalized = normalized.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    // remove weird chars
    normalized = normalized.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.\,\-\/\\"]/g, '');
    return normalized.trim();
}

function standardizeCategory(cat) {
    if (!cat) return 'accesorios';
    const c = cat.toLowerCase();
    if (c.includes('camara') || c.includes('camera')) return 'cámaras';
    if (c.includes('kit')) return 'kits';
    if (c.includes('nvr') || c.includes('dvr') || c.includes('recorder') || c.includes('grabador')) return 'grabadores';
    if (c.includes('smart') || c.includes('home') || c.includes('inteli')) return 'smarthome';
    if (c.includes('red') || c.includes('network') || c.includes('wifi') || c.includes('router') || c.includes('switch')) return 'redes';
    return 'accesorios'; 
}

function processCatalog() {
    let products = [];
    try {
        products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    } catch(e) {
        console.error("Failed to read products.json", e);
        return;
    }

    const errorReport = {
        missingFields: [],
        invalidImages: [],
        duplicatesRemoved: [],
        totalProcessed: 0,
        totalErrors: 0
    };

    const uniqueNames = new Set();
    const cleanProducts = [];

    products.forEach((p, index) => {
        const itemErrors = [];

        // 1. DEDUPLICATION
        let originalName = p.name || '';
        let normName = normalizeSpanishName(originalName);
        
        if (!normName || uniqueNames.has(normName.toLowerCase())) {
            errorReport.duplicatesRemoved.push(originalName || `Item at index ${index}`);
            errorReport.totalErrors++;
            return; // skip duplicate or empty
        }
        uniqueNames.add(normName.toLowerCase());

        // 2. NAME & CATEGORY STANDARD
        p.name = normName;
        p.category = standardizeCategory(p.category);

        // 3. REQUIRED FIELDS
        if (!p.description || p.description.trim() === '') {
            p.description = "Descripción pendiente de actualización.";
            itemErrors.push("Missing description (auto-filled)");
        }
        
        if (!p.whatsappMessage) {
            p.whatsappMessage = `Hola CCTV OFERTAS, estoy interesado en: ${p.name}`;
        }

        // 4. IMAGE VALIDATION
        if (!p.image || p.image.trim() === '' || p.image.includes('null') || p.image.includes('undefined')) {
            itemErrors.push("Missing or broken image reference");
        } else {
            const imgPath = path.join(projectDir, p.image.replace(/\//g, path.sep));
            if (!fs.existsSync(imgPath)) {
                itemErrors.push(`Image file does not exist locally: ${p.image}`);
            }
        }

        if (itemErrors.length > 0) {
            errorReport.missingFields.push({ name: p.name, errors: itemErrors });
            errorReport.totalErrors += itemErrors.length;
        }

        cleanProducts.push(p);
    });

    errorReport.totalProcessed = cleanProducts.length;

    // Save outputs
    fs.writeFileSync(productsPath, JSON.stringify(cleanProducts, null, 4), 'utf8');
    fs.writeFileSync(reportPath, JSON.stringify(errorReport, null, 4), 'utf8');

    console.log(`Validation Complete.`);
    console.log(`Processed: ${errorReport.totalProcessed}`);
    console.log(`Duplicates Removed: ${errorReport.duplicatesRemoved.length}`);
    console.log(`Total Validation Errors: ${errorReport.totalErrors}`);
    console.log(`Check src/data/error_report.json for details.`);
}

processCatalog();
