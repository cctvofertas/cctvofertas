/**
 * Global Configuration for CCTV OFERTAS
 * Centralized settings for easy maintenance and branding updates.
 */

const SITE_CONFIG = {
    company: {
        name: "CCTV OFERTAS",
        tagline: "Expertos en Seguridad y Videovigilancia Profesional",
        location: "Bogotá, Colombia",
        address: "Bogotá, Colombia",
        email: "ventas@cctvofertas.com",
        phone: "+57 301 492 4988",
        whatsapp: "573014924988" // Without '+' or spaces
    },
    social: {
        facebook: "https://facebook.com/cctvofertas",
        instagram: "https://instagram.com/cctvofertas",
        whatsapp: "https://wa.me/573014924988"
    },
    catalog: {
        itemsPerPage: 8,
        featuredCategories: ['cameras', 'kits', 'recorders', 'smarthome']
    },
    version: "1.1.2"
};

export default SITE_CONFIG;
