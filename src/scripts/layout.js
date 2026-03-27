import SITE_CONFIG from '../config/site-config.js';

/**
 * Layout Engine for CCTV OFERTAS
 * Handles dynamic injection of Header and Footer and path resolution for static sites.
 */

async function injectLayout() {
    const headerContainer = document.getElementById('site-header');
    const footerContainer = document.getElementById('site-footer');

    // Robust path detection
    const pathParts = window.location.pathname.split('/');
    const isInPages = pathParts.includes('pages');
    const depth = isInPages ? '../../' : '';
    
    const resolvePath = (relPath) => depth + relPath;

    try {
        // Inject Top Notification Bar globally
        const topBar = document.createElement('div');
        topBar.className = 'top-notification-bar';
        topBar.innerHTML = `
            <div class="container" style="display: flex; justify-content: center; align-items: center; gap: 10px;">
                <span class="pulse-dot"></span>
                <p style="margin: 0; font-size: 0.82rem; font-weight: 600; color: white; letter-spacing: 0.5px; text-transform: uppercase;">🔥 Calidad profesional <strong style="color: var(--accent-neon);">UNIVIEW</strong> a precios insuperables.</p>
                <a href="${resolvePath('src/pages/products.html')}?brand=uniview" style="color: var(--white-pure); font-size: 0.82rem; font-weight: 800; text-decoration: underline; margin-left: 5px;">VER OFERTAS</a>
            </div>
        `;
        document.body.insertBefore(topBar, document.body.firstChild);

        // Load Header
        if (headerContainer) {
            const response = await fetch(resolvePath('src/components/layout/header.html'));
            if (!response.ok) throw new Error('Failed to load header');
            let html = await response.text();
            
            // Basic template substitution for common values
            html = html.replace(/{{COMPANY_NAME}}/g, SITE_CONFIG.company.name);
            
            headerContainer.innerHTML = html;
            
            // Adjust links and image sources for nested pages
            headerContainer.querySelectorAll('a, img').forEach(el => {
                const attr = el.tagName.toLowerCase() === 'a' ? 'href' : 'src';
                const val = el.getAttribute(attr);
                if (val && !val.startsWith('http') && !val.startsWith('#') && !val.startsWith('data:')) {
                    // Prepend depth to all relative internal links/sources
                    const cleanVal = val.startsWith('/') ? val.substring(1) : val;
                    el.setAttribute(attr, resolvePath(cleanVal));
                }
            });
            
            setActiveLink();
            initMobileMenu();
        }

        // Load Footer
        if (footerContainer) {
            const response = await fetch(resolvePath('src/components/layout/footer.html'));
            if (!response.ok) throw new Error('Failed to load footer');
            let html = await response.text();
            
            // Substitution
            html = html.replace(/{{WHATSAPP_LINK}}/g, SITE_CONFIG.social.whatsapp);
            html = html.replace(/{{PHONE}}/g, SITE_CONFIG.company.phone);
            html = html.replace(/{{EMAIL}}/g, SITE_CONFIG.company.email);
            html = html.replace(/{{YEAR}}/g, new Date().getFullYear());
            
            footerContainer.innerHTML = html;
            
            // Adjust links and image sources
            footerContainer.querySelectorAll('a, img').forEach(el => {
                const attr = el.tagName.toLowerCase() === 'a' ? 'href' : 'src';
                const val = el.getAttribute(attr);
                if (val && !val.startsWith('http') && !val.startsWith('#') && !val.startsWith('data:')) {
                    const cleanVal = val.startsWith('/') ? val.substring(1) : val;
                    el.setAttribute(attr, resolvePath(cleanVal));
                }
            });
        }
    } catch (error) {
        console.error('Layout Engine Error:', error);
    }
}

function setActiveLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Match base filename to handle depth differences
        const filename = href.split('/').pop();
        if (currentPath.endsWith(filename) || (currentPath.endsWith('/') && filename === 'index.html')) {
            link.classList.add('active');
        }
    });
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.onclick = () => {
            mainNav.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.className = mainNav.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
            }
        };
    }
}

// Optimized Scroll Listener
let lastScrollY = 0;
window.addEventListener('scroll', () => {
    const siteHeader = document.getElementById('site-header');
    if (!siteHeader) return;

    const currentScrollY = window.scrollY;
    if (currentScrollY > 50) {
        siteHeader.classList.add('site-header--scrolled');
    } else {
        siteHeader.classList.remove('site-header--scrolled');
    }
    lastScrollY = currentScrollY;
}, { passive: true });

// Execute injection
injectLayout();
