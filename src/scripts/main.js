// Main JS for CCTV OFERTAS
import { initSecurityGrid } from './background.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Security Grid Background
    initSecurityGrid('security-grid-canvas');

    // Simple scroll reveal - Extracted to classes for performance
    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (elementTop < windowHeight - 100) {
                el.classList.add('visible');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check
});
