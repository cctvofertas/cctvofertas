document.addEventListener('DOMContentLoaded', async () => {
    const catalogsGrid = document.getElementById('catalogs-grid');
    if (!catalogsGrid) return;
    
    try {
        const response = await fetch('../data/catalogs.json');
        if (!response.ok) throw new Error('Could not fetch catalogs');
        
        const catalogs = await response.json();
        
        if (catalogs.length === 0) {
            catalogsGrid.innerHTML = '<p class="text-slate">Próximamente agregaremos nuestros catálogos.</p>';
            return;
        }
        
        catalogsGrid.innerHTML = '';
        
        catalogs.forEach(catalog => {
            const card = document.createElement('div');
            card.className = 'glass';
            card.style.cssText = 'padding: 25px; border-radius: 15px; text-align: left; max-width: 320px; flex: 1 1 300px; display: flex; flex-direction: column;';
            
            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <div style="width: 50px; height: 50px; border-radius: 12px; background: rgba(0, 240, 255, 0.1); display: flex; align-items: center; justify-content: center; color: var(--accent-electric); font-size: 1.5rem;">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <h3 style="font-size: 1.2rem; margin: 0; color: white;">${catalog.title}</h3>
                </div>
                <p class="text-slate" style="font-size: 0.9rem; margin-bottom: 25px; flex-grow: 1;">${catalog.description}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="text-slate" style="font-size: 0.8rem;"><i class="fas fa-download"></i> PDF</span>
                    <a href="../assets/catalogs/${catalog.file}" target="_blank" class="btn btn-primary" style="padding: 8px 20px; font-size: 0.9rem; border-radius: 8px; width: auto; height: auto;">
                        Descargar
                    </a>
                </div>
            `;
            catalogsGrid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading catalogs:', error);
        catalogsGrid.innerHTML = '<p class="text-slate">Error al cargar los catálogos. Por favor, intenta más tarde.</p>';
    }
});
