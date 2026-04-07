import SITE_CONFIG from '../config/site-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const filters = document.querySelectorAll('.filter-list li');
    const productContainer = document.getElementById('product-container');
    const whatsappBase = SITE_CONFIG.social.whatsapp;

    let products = [];

    // Fetch products from local JSON
    try {
        const response = await fetch('../data/products.json');
        products = await response.json();
    } catch (error) {
        console.error('Error loading products:', error);
        productContainer.innerHTML = '<p class="text-slate">Error al cargar el catálogo.</p>';
        return;
    }

    // State for active filters and pagination
    let activeFilters = {
        category: 'all',
        tech: 'all',
        brand: 'all',
        searchQuery: ''
    };
    
    // UI Elements
    const searchInput = document.getElementById('product-search');
    const resetBtn = document.getElementById('reset-filters');
    const paginationContainer = document.getElementById('pagination-container');
    const paginationContainerTop = document.getElementById('pagination-container-top');
    const btnViewGrid = document.getElementById('view-grid');
    const btnViewList = document.getElementById('view-list');
    
    // --- View Toggle Logic ---
    let currentView = localStorage.getItem('catalogView') || 'grid';
    
    function applyViewMode() {
        if (!productContainer) return;
        if (currentView === 'list') {
            productContainer.classList.add('list-view');
            btnViewList?.classList.add('active');
            btnViewGrid?.classList.remove('active');
        } else {
            productContainer.classList.remove('list-view');
            btnViewGrid?.classList.add('active');
            btnViewList?.classList.remove('active');
        }
    }

    if (btnViewGrid && btnViewList) {
        btnViewGrid.addEventListener('click', () => {
            currentView = 'grid';
            localStorage.setItem('catalogView', 'grid');
            applyViewMode();
        });
        btnViewList.addEventListener('click', () => {
            currentView = 'list';
            localStorage.setItem('catalogView', 'list');
            applyViewMode();
        });
    }
    
    // Apply initial view
    applyViewMode();
    
    let currentPage = 1;
    const itemsPerPage = SITE_CONFIG.catalog.itemsPerPage;
    
    // --- Debounce Helper ---
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // --- Search Logic ---
    if (searchInput) {
        const handleSearch = debounce((e) => {
            activeFilters.searchQuery = e.target.value.toLowerCase().trim();
            currentPage = 1;
            renderProducts();
        }, 300);
        
        searchInput.addEventListener('input', handleSearch);
    }
    
    // --- Reset Filters Logic ---
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            // Reset active filters state
            activeFilters = {
                category: 'all',
                tech: 'all',
                brand: 'all',
                searchQuery: ''
            };
            
            // Reset search input
            if (searchInput) searchInput.value = '';
            
            // Reset UI filter selection
            document.querySelectorAll('.filter-list li').forEach(li => {
                if (li.dataset.filter === 'all') {
                    li.classList.add('active');
                } else {
                    li.classList.remove('active');
                }
            });
            
            currentPage = 1;
            renderProducts();
        });
    }

    // --- Dynamic Rendering ---
    function renderProducts() {
        if (!productContainer) return;
        
        // Add fade-out effect
        productContainer.style.opacity = '0.5';
        productContainer.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            productContainer.innerHTML = '';
            
            const filtered = products.filter(product => {
                const matchesCategory = activeFilters.category === 'all' || product.category === activeFilters.category;
                const matchesTech = activeFilters.tech === 'all' || product.tech === activeFilters.tech;
                const matchesBrand = activeFilters.brand === 'all' || (product.brand && product.brand.toLowerCase() === activeFilters.brand.toLowerCase());
                
                // Search filter (name or brand)
                const matchesSearch = !activeFilters.searchQuery || 
                    product.name.toLowerCase().includes(activeFilters.searchQuery) || 
                    (product.brand && product.brand.toLowerCase().includes(activeFilters.searchQuery));
                
                return matchesCategory && matchesTech && matchesBrand && matchesSearch;
            });

            // Pagination calculation
            const totalPages = Math.ceil(filtered.length / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

            if (filtered.length === 0) {
                productContainer.innerHTML = `
                    <div class="glass reveal visible" style="grid-column: 1/-1; padding: 60px; text-align: center; width: 100%;">
                        <i class="fas fa-search" style="font-size: 3rem; color: var(--slate-500); margin-bottom: 20px; display: block;"></i>
                        <h3 style="color: var(--white-pure); margin-bottom: 10px;">No se encontraron resultados</h3>
                        <p class="text-slate">Intenta ajustar los filtros o el término de búsqueda.</p>
                        <button class="btn btn--secondary btn--sm" style="margin-top: 20px;" id="no-results-reset">Resetear Filtros</button>
                    </div>
                `;
                if (paginationContainer) paginationContainer.innerHTML = '';
                if (paginationContainerTop) paginationContainerTop.innerHTML = '';
                
                // Attach event to the dynamically created reset button
                document.getElementById('no-results-reset')?.addEventListener('click', () => resetBtn.click());
            } else {
                paginatedItems.forEach((product, index) => {
                    const card = document.createElement('article');
                    card.className = 'glass product-card reveal';
                    // Staggered animation
                    card.style.transitionDelay = `${index * 0.05}s`;
                    
                    // Path correction for sub-pages
                    let imgPath = product.image;
                    // Check if we are in a sub-directory and need to adjust paths for local assets
                    const isSubPage = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/');
                    if (isSubPage && !imgPath.startsWith('http') && imgPath.includes('src/assets/')) {
                        // Replace 'src/assets/' with '../assets/' to correctly reach the sibling folder from 'src/pages/'
                        imgPath = imgPath.replace('src/assets/', '../assets/');
                    }
                    
                    const isUniview = product.brand && product.brand.toLowerCase() === 'uniview';
                    const specialBadge = isUniview ? 
                        `<div class="uniview-badge-special"><i class="fas fa-star" style="color: yellow;"></i> OFERTA ESPECIAL</div>` : '';

                    card.innerHTML = `
                        <div class="product-card__image-wrapper">
                            ${specialBadge}
                            <img src="${imgPath}" alt="${product.name}" class="product-card__image" loading="lazy">
                            <div class="product-card__badge" style="position: absolute; top: 1rem; right: 1rem; background: var(--accent-electric); color: white; padding: 4px 12px; border-radius: 100px; font-size: 0.65rem; font-weight: 700;">${product.category.toUpperCase()}</div>
                        </div>
                        <div class="product-card__content">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span class="product-card__brand">${product.brand || 'Original'}</span>
                                <span class="product-card__tech" style="font-size: 0.65rem; color: var(--slate-500); text-transform: uppercase;">${product.tech || ''}</span>
                            </div>
                            <h3 class="product-card__title">${product.name}</h3>
                            <p class="product-card__desc" style="font-size: 0.85rem; color: var(--slate-400); line-height: 1.6; margin-bottom: 1.5rem; flex-grow: 1;">${product.description}</p>
                            <div class="product-card__footer" style="padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05);">
                                <button class="btn btn--primary buy-btn" style="width: 100%; display: flex; justify-content: center; align-items: center; gap: 10px;">
                                    <i class="fab fa-whatsapp"></i> Cotizar Ahora
                                </button>
                            </div>
                        </div>
                    `;
                    productContainer.appendChild(card);
                    
                    // Trigger reveal after creation
                    setTimeout(() => card.classList.add('visible'), 50);

                    // Re-attach WhatsApp click event
                    const buyBtn = card.querySelector('.buy-btn');
                    buyBtn.addEventListener('click', () => {
                        const message = encodeURIComponent(`Hola CCTV OFERTAS, me interesa el producto: ${product.name}. Quisiera más información y una cotización.`);
                        window.open(`${whatsappBase}?text=${message}`, '_blank');
                    });
                });

                renderPagination(totalPages);
            }
            
            // Fade back in
            productContainer.style.opacity = '1';
            productContainer.style.transform = 'translateY(0)';
            productContainer.style.transition = 'all 0.4s ease';
        }, 300);
    }

    function renderPagination(totalPages) {
        if (!paginationContainer || totalPages <= 1) {
            if (paginationContainer) paginationContainer.innerHTML = '';
            if (paginationContainerTop) paginationContainerTop.innerHTML = '';
            return;
        }

        let html = '';
        
        // --- First Page Button ---
        html += `
            <button class="pagination-btn pagination-btn--icon first-page" ${currentPage === 1 ? 'disabled' : ''} title="Primera Página">
                <i class="fas fa-angle-double-left"></i>
            </button>
        `;

        // --- Prev Page Button ---
        html += `
            <button class="pagination-btn pagination-btn--wide prev-page" ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // --- Page Numbers Logic (Sliding Window) ---
        const delta = 1; // Range around current page
        const range = [];
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        // Add First Page
        html += `<button class="pagination-btn ${1 === currentPage ? 'active' : ''}" data-page="1">1</button>`;

        if (currentPage - delta > 2) {
            html += `<span class="pagination-dots">...</span>`;
        }

        range.forEach(i => {
            html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        });

        if (currentPage + delta < totalPages - 1) {
            html += `<span class="pagination-dots">...</span>`;
        }

        // Add Last Page
        if (totalPages > 1) {
            html += `<button class="pagination-btn ${totalPages === currentPage ? 'active' : ''}" data-page="${totalPages}">${totalPages}</button>`;
        }

        // --- Next Page Button ---
        html += `
            <button class="pagination-btn pagination-btn--wide next-page" ${currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        // --- Last Page Button ---
        html += `
            <button class="pagination-btn pagination-btn--icon last-page" ${currentPage === totalPages ? 'disabled' : ''} title="Última Página">
                <i class="fas fa-angle-double-right"></i>
            </button>
        `;

        // --- Go To Page Input ---
        if (totalPages > 1) {
            html += `
                <div class="go-to-page" style="display: inline-flex; align-items: center; gap: 8px; margin-left: 15px;">
                    <span style="font-size: 0.85rem; color: var(--slate-400); font-weight: 600;">Ir a:</span>
                    <input type="number" min="1" max="${totalPages}" class="goto-input" placeholder="${currentPage}" style="width: 50px; padding: 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); color: white; text-align: center; outline: none; font-family: var(--font-mono); font-size: 0.85rem;">
                    <button class="btn-secondary goto-btn" title="Ir a la página" style="padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(99, 102, 241, 0.3); background: rgba(99, 102, 241, 0.15); color: var(--white-pure); cursor: pointer; transition: all 0.3s;"><i class="fas fa-arrow-right"></i></button>
                </div>
            `;
        }

        paginationContainer.innerHTML = html;
        paginationContainer.classList.add('visible');
        
        if (paginationContainerTop) {
            paginationContainerTop.innerHTML = html;
            paginationContainerTop.classList.add('visible');
        }

        // --- Event Listeners ---
        const bindEvents = (container) => {
            if (!container) return;
            
            container.querySelector('.first-page')?.addEventListener('click', () => {
                if (currentPage !== 1) {
                    currentPage = 1;
                    updateView();
                }
            });

            container.querySelector('.last-page')?.addEventListener('click', () => {
                if (currentPage !== totalPages) {
                    currentPage = totalPages;
                    updateView();
                }
            });

            container.querySelector('.prev-page')?.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    updateView();
                }
            });

            container.querySelector('.next-page')?.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    updateView();
                }
            });

            container.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
                btn.addEventListener('click', () => {
                    currentPage = parseInt(btn.dataset.page);
                    updateView();
                });
            });

            container.querySelector('.goto-btn')?.addEventListener('click', () => {
                const input = container.querySelector('.goto-input');
                if (input && input.value.trim() !== '') {
                    let page = parseInt(input.value);
                    if (!isNaN(page)) {
                        if (page < 1) page = 1;
                        if (page > totalPages) page = totalPages;
                        if (currentPage !== page) {
                            currentPage = page;
                            updateView();
                        }
                    }
                }
            });

            container.querySelector('.goto-input')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    container.querySelector('.goto-btn')?.click();
                }
            });
        };
        
        bindEvents(paginationContainer);
        bindEvents(paginationContainerTop);
    }

    function updateView() {
        renderProducts();
        window.scrollTo({ top: productContainer.offsetTop - 150, behavior: 'smooth' });
    }

    // --- URL Param Handling ---
    const urlParams = new URLSearchParams(window.location.search);
    ['cat', 'brand', 'tech'].forEach(param => {
        const val = urlParams.get(param);
        if (val) {
            const type = param === 'cat' ? 'category' : param;
            activeFilters[type] = val;
            filters.forEach(f => {
                if (f.dataset.filter === val && f.parentElement.dataset.filterType === type) {
                    f.parentElement.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                    f.classList.add('active');
                }
            });
        }
    });

    // --- Filtering Event Listeners ---
    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            const filterType = filter.parentElement.dataset.filterType;
            const filterValue = filter.dataset.filter;

            // Update UI with immediate response
            filter.parentElement.querySelectorAll('li').forEach(li => li.classList.remove('active'));
            filter.classList.add('active');

            // Update state and re-render
            activeFilters[filterType] = filterValue;
            currentPage = 1; // Reset to page 1 on filter
            renderProducts();
            
            // Smooth scroll to top of container if needed
            if (window.innerWidth < 992) {
                productContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Initial render
    renderProducts();
});
