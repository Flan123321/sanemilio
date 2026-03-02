// ===================================
// SAN EMILIO PROPIEDADES
// Premium Real Estate Platform JS
// ===================================

// ===== CONFIGURATION =====
const CONFIG = {
    heroSlideInterval: 6000,
    testimonialInterval: 8000,
    fadeThreshold: 0.15,
    scrollDebounce: 100,
    dataFile: 'propiedades.json'
};

// ===== UTILITY FUNCTIONS =====
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

//===== HEADER SCROLL EFFECT =====
class HeaderController {
    constructor() {
        this.header = $('#header');
        if (!this.header) return;
        this.init();
    }

    init() {
        window.addEventListener('scroll', debounce(() => this.handleScroll(), CONFIG.scrollDebounce));
    }

    handleScroll() {
        // scrollY es el estándar moderno; pageYOffset está obsoleto
        this.header.classList.toggle('scrolled', window.scrollY > 50);
    }
}

// ===== MOBILE MENU =====
class MobileMenu {
    constructor() {
        this.toggle = $('#mobileToggle');
        this.menu = $('#navMenu');
        this.header = $('#header');
        if (!this.toggle || !this.menu) return;
        this.init();
    }

    init() {
        // Toggle hamburger
        this.toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        // Mobile dropdowns: tap on parent link expands submenu
        this.menu.querySelectorAll('.dropdown > a').forEach(a => {
            a.addEventListener('click', (e) => {
                if (window.innerWidth < 1024) {
                    e.preventDefault();
                    a.closest('.dropdown').classList.toggle('is-open');
                }
            });
        });

        // Close when clicking a non-dropdown link
        this.menu.querySelectorAll('li:not(.dropdown) > a').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.header && !this.header.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Reset on desktop resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) this.closeMenu();
        });
    }

    toggleMenu() {
        const isOpen = this.menu.classList.toggle('is-open');
        this.toggle.setAttribute('aria-expanded', String(isOpen));
        this.toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    }

    closeMenu() {
        this.menu.classList.remove('is-open');
        this.menu.querySelectorAll('.dropdown').forEach(d => d.classList.remove('is-open'));
        this.toggle.setAttribute('aria-expanded', 'false');
        this.toggle.setAttribute('aria-label', 'Abrir menú');
    }
}


// ===== PROPERTY DATA MANAGER (NEW) =====
class PropertyManager {
    constructor() {
        this.properties = [];
        this.filteredProperties = [];
        this.container = $('#propertiesContainer');
        this.mapContainer = $('#catalogMap');
        this.paginationContainer = $('#paginationControls');
        this.map = null;
        this.markers = [];

        // Init only if we are on the catalog page
        if (!this.container) return;

        this.init();
    }

    async init() {
        // loadProperties() ya llama a renderProperties() e initMap() internamente.
        await this.loadProperties();
        this.setupFilters();
        // ─── LEER PARÁMETROS URL y pre-filtrar el catálogo ───
        // e.g. /propiedades.html?tipo=departamento&operacion=arriendo
        this.applyURLParams();
    }

    /**
     * Lee los query params de la URL y los aplica como filtros preseleccionados.
     * Esto permite que links del tipo ?tipo=departamento abran el catálogo ya filtrado.
     */
    applyURLParams() {
        const params = new URLSearchParams(window.location.search);

        // Mapeo de param → selector en el formulario del sidebar
        const mappings = {
            tipo: '[name="tipo"]',
            operacion: '[name="operacion"]',  // radio o select
            comuna: '[name="comuna"]',
            precio_max: '[name="precioMax"]',
            precio_min: '[name="precioMin"]',
            dormitorios: '[name="dormitorios"]',
        };

        let hasParams = false;

        for (const [param, selector] of Object.entries(mappings)) {
            const value = params.get(param);
            if (!value) continue;
            hasParams = true;

            const el = document.querySelector(selector);
            if (!el) continue;

            if (el.type === 'radio') {
                // Para radios buscamos el que tenga ese valor
                const radio = document.querySelector(`${selector}[value="${value}"]`);
                if (radio) radio.checked = true;
            } else if (el.tagName === 'SELECT') {
                // Buscar opción case-insensitive
                const opt = Array.from(el.options).find(
                    o => o.value.toLowerCase() === value.toLowerCase()
                );
                if (opt) opt.selected = true;
            } else {
                el.value = value;
            }
        }

        // Mostrar el chip de tipo activo en la UI si existe
        const tipoParam = params.get('tipo');
        if (tipoParam) {
            // Actualizar el título de la página header para dar feedback
            const pageTitle = document.querySelector('.page-header h1, .page-header .page-title');
            if (pageTitle) {
                const labels = {
                    casa: 'Casas', departamento: 'Departamentos', parcela: 'Parcelas',
                    terreno: 'Terrenos', comercial: 'Locales Comerciales'
                };
                pageTitle.textContent = labels[tipoParam.toLowerCase()] || pageTitle.textContent;
            }
        }

        // Si había algún parámetro, aplicar los filtros automáticamente
        if (hasParams) this.applyFilters();
    }

    async loadProperties() {
        try {
            const response = await fetch(CONFIG.dataFile);
            if (!response.ok) throw new Error('Error al cargar propiedades');
            this.properties = await response.json();
            this.filteredProperties = [...this.properties];
            console.log(`✅ ${this.properties.length} propiedades cargadas.`);
            this.renderProperties();
            this.initMap();
        } catch (error) {
            console.error('Error loading properties:', error);
            // Always show fallback if something fails, so user never sees specific 'loading' forever if detail fetch fails
            this.useFallbackData();
        }
    }

    useFallbackData() {
        console.warn('⚠️ Usando datos de respaldo (Fallback Data)');
        this.properties = [
            { id: 1, titulo: "Casa Moderna Vista al Volcán", precioCLP: 385000000, dormitorios: 4, banos: 3, m2Utiles: 280, comuna: "Temuco", lat: -38.7359, lng: -72.5904, imagenPrincipal: "https://images.unsplash.com/photo-1600596542815-6000255adeba", destacada: true },
            { id: 2, titulo: "Departamento Centro Temuco", precioCLP: 165000000, dormitorios: 3, banos: 2, m2Utiles: 110, comuna: "Temuco", lat: -38.7400, lng: -72.5950, imagenPrincipal: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00", destacada: false }
        ];
        this.filteredProperties = [...this.properties];
        this.renderProperties();
        this.initMap();
    }

    renderProperties() {
        if (!this.container) return;

        // Limpiar el contenedor de forma segura
        this.container.innerHTML = '';

        // Actualizar contador de resultados
        this.updateResultsCount();

        if (this.filteredProperties.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'No se encontraron propiedades con esos filtros.';
            this.container.appendChild(noResults);
            return;
        }

        // Placeholder SVG local (sin dependencia de via.placeholder.com)
        const PLACEHOLDER_IMG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23E8E6E3'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='18' fill='%237A7A7A' text-anchor='middle' dy='.3em'%3ESin Imagen%3C/text%3E%3C/svg%3E`;

        this.filteredProperties.forEach(prop => {
            const card = document.createElement('article');
            card.className = 'property-card-catalog';
            card.setAttribute('data-fade-up', '');

            const imgUrl = prop.imagenPrincipal || PLACEHOLDER_IMG;

            // --- Construcción segura por DOM API (evita XSS) ---
            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'property-image-wrapper';

            const imgDiv = document.createElement('div');
            imgDiv.className = 'property-image';
            imgDiv.style.cssText = 'background-size:cover;background-position:center;';
            imgDiv.style.backgroundImage = `url('${imgUrl}')`;
            imgWrapper.appendChild(imgDiv);

            if (prop.destacada) {
                const badge = document.createElement('div');
                badge.className = 'property-badge';
                badge.textContent = 'Exclusiva';
                imgWrapper.appendChild(badge);
            }

            const favBtn = document.createElement('button');
            favBtn.className = 'property-favorite';
            favBtn.setAttribute('aria-label', 'Guardar en favoritos');
            favBtn.setAttribute('aria-pressed', 'false');
            favBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 17.5l-6.5-6.5c-2-2-2-5.5 0-7.5s5.5-2 7.5 0l-.5.5.5-.5c2 2 5.5 2 7.5 0s2 5.5 0 7.5L10 17.5z" stroke="currentColor" stroke-width="1.5"/></svg>`;
            imgWrapper.appendChild(favBtn);

            const content = document.createElement('div');
            content.className = 'property-content';

            const price = document.createElement('div');
            price.className = 'property-price';
            price.textContent = formatCurrency(prop.precioCLP);

            const title = document.createElement('h3');
            title.className = 'property-title';
            title.textContent = prop.titulo;

            const location = document.createElement('p');
            location.className = 'property-location';
            location.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 8a2 2 0 100-4 2 2 0 000 4z" fill="currentColor"/><path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`;
            const locationText = document.createTextNode(prop.comuna || 'Araucanía');
            location.appendChild(locationText);

            const features = document.createElement('div');
            features.className = 'property-features';
            const fData = [
                `${prop.dormitorios || '-'} Dorms`,
                `${prop.banos || '-'} Baños`,
                `${prop.m2Utiles || '-'} m²`
            ];
            fData.forEach(text => {
                const span = document.createElement('span');
                span.className = 'feature';
                span.textContent = text;
                features.appendChild(span);
            });

            const detailLink = document.createElement('a');
            detailLink.href = `propiedad-detalle.html?id=${Number(prop.id)}`;
            detailLink.className = 'btn-ver-detalles';
            detailLink.textContent = 'Ver Detalles';

            content.append(price, title, location, features, detailLink);
            card.append(imgWrapper, content);
            this.container.appendChild(card);
        });

        this.initFavoriteButtons();
    }

    updateResultsCount() {
        const counter = document.querySelector('#resultsCount');
        if (counter) counter.textContent = this.filteredProperties.length;
    }

    initFavoriteButtons() {
        const favoriteButtons = $$('.property-favorite');
        favoriteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                btn.classList.toggle('active');
                const icon = btn.querySelector('path');
                if (btn.classList.contains('active')) {
                    icon.setAttribute('fill', 'currentColor');
                } else {
                    icon.setAttribute('fill', 'none');
                }
            });
        });
    }

    initMap() {
        if (!this.mapContainer || typeof L === 'undefined') return;

        // Default Temuco
        const defaultLat = -38.7359;
        const defaultLng = -72.5904;

        this.map = L.map('catalogMap').setView([defaultLat, defaultLng], 12);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(this.map);

        this.updateMapMarkers();

        // Refresh map when tab is switched (Leaflet needs resize trigger)
        const mapTabBtn = $('#viewMap');
        if (mapTabBtn) {
            mapTabBtn.addEventListener('click', () => {
                setTimeout(() => {
                    this.map.invalidateSize();
                }, 100);
            });
        }
    }

    updateMapMarkers() {
        if (!this.map) return;

        // Clear existing markers
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        this.filteredProperties.forEach(prop => {
            if (prop.lat && prop.lng) {
                const icon = L.divIcon({
                    className: 'custom-pin',
                    html: `<div style="background-color: var(--orange-primary); width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });

                const marker = L.marker([prop.lat, prop.lng], { icon: icon })
                    .bindPopup(`
                        <div style="width: 200px;">
                            <div style="height: 120px; background-image: url('${prop.imagenPrincipal || ''}'); background-size: cover; border-radius: 8px; margin-bottom: 8px;"></div>
                            <b>${formatCurrency(prop.precioCLP)}</b><br>
                            ${prop.titulo}
                            <a href="propiedad-detalle.html?id=${prop.id}" style="display:block; margin-top:8px; color: var(--orange-primary); font-weight:600;">Ver Ficha</a>
                        </div>
                    `);

                marker.addTo(this.map);
                this.markers.push(marker);
            }
        });
    }

    setupFilters() {
        // Usar ID específico en vez de selector de clase genérico para evitar colisiones
        const applyBtn = document.querySelector('#catalogSidebar .btn-primary');
        const resetBtn = document.querySelector('#resetFilters');

        applyBtn?.addEventListener('click', () => this.applyFilters());
        resetBtn?.addEventListener('click', () => this.resetFilters());

        // Botones de número (dormitorios / baños) — solo un activo por grupo
        document.querySelectorAll('.number-selector').forEach(selector => {
            selector.querySelectorAll('.number-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    selector.querySelectorAll('.number-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.toggle('active', true);
                });
            });
        });
    }

    applyFilters() {
        // Operación: puede ser radio button o select
        const operacionRadio = document.querySelector('[name="operacion"]:checked');
        const operacionSelect = document.querySelector('select[name="operacion"]');
        const operacion = (operacionRadio?.value || operacionSelect?.value || '').toLowerCase();

        const tipoEl = document.querySelector('[name="tipo"]') ||
            document.querySelector('select[name="tipo"]');
        const tipo = (tipoEl?.value || '').toLowerCase();

        const comunaEl = document.querySelector('[name="comuna"]') ||
            document.querySelector('select[name="comuna"]');
        const comuna = (comunaEl?.value || '').toLowerCase();

        // Dormitorios: primero busca button activo, luego input numérico
        const dormBtn = document.querySelector('.number-btn.active[data-value]');
        const dormInput = document.querySelector('[name="dormitorios"]');
        const dormMin = dormBtn
            ? parseInt(dormBtn.dataset.value, 10)
            : (dormInput ? parseInt(dormInput.value, 10) || 0 : 0);

        const precioMaxRaw = document.querySelector('[name="precioMax"]')?.value;
        const precioMax = precioMaxRaw
            ? parseFloat(String(precioMaxRaw).replace(/[^0-9.]/g, ''))
            : Infinity;

        const precioMinRaw = document.querySelector('[name="precioMin"]')?.value;
        const precioMin = precioMinRaw
            ? parseFloat(String(precioMinRaw).replace(/[^0-9.]/g, ''))
            : 0;

        this.filteredProperties = this.properties.filter(p => {
            if (operacion && p.operacion?.toLowerCase() !== operacion) return false;
            if (tipo && p.tipo?.toLowerCase() !== tipo) return false;
            if (comuna && p.comuna?.toLowerCase() !== comuna) return false;
            if (dormMin && (p.dormitorios || 0) < dormMin) return false;
            if ((p.precioCLP || 0) < precioMin) return false;
            if ((p.precioCLP || 0) > precioMax) return false;
            return true;
        });

        this.renderProperties();
        this.updateMapMarkers();
    }

    resetFilters() {
        // Limpiar todos los selects y inputs del sidebar
        document.querySelectorAll('.filter-select, select[name]').forEach(s => s.selectedIndex = 0);
        document.querySelectorAll('.filter-input, input[name]').forEach(i => {
            if (i.type !== 'radio') i.value = '';
        });
        document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('active'));

        // Reset radio de operación al primer valor disponible
        const firstRadio = document.querySelector('[name="operacion"]');
        if (firstRadio) firstRadio.checked = true;

        // Limpiar URL sin recargar la página
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);

        this.filteredProperties = [...this.properties];
        this.renderProperties();
        this.updateMapMarkers();
    }
}


// ===== HERO SLIDER =====
class HeroSlider {
    constructor() {
        this.slider = $('#heroSlider');
        // Only run if slider exists (Home Page)
        if (!this.slider) return;

        this.slides = $$('.hero-slide');
        this.dots = $$('.dot');
        this.prevBtn = $('#sliderPrev');
        this.nextBtn = $('#sliderNext');

        if (this.slides.length === 0) return;

        this.currentSlide = 0;
        this.autoplayInterval = null;
        this.init();
    }

    init() {
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        this.startAutoplay();
        this.slider.addEventListener('mouseenter', () => this.stopAutoplay());
        this.slider.addEventListener('mouseleave', () => this.startAutoplay());
    }

    goToSlide(index) {
        this.slides[this.currentSlide].classList.remove('active');
        this.dots[this.currentSlide].classList.remove('active');
        this.currentSlide = index;
        this.slides[this.currentSlide].classList.add('active');
        this.dots[this.currentSlide].classList.add('active');
    }

    next() {
        const nextSlide = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextSlide);
    }

    prev() {
        const prevSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevSlide);
    }

    startAutoplay() {
        this.autoplayInterval = setInterval(() => this.next(), CONFIG.heroSlideInterval);
    }

    stopAutoplay() {
        clearInterval(this.autoplayInterval);
    }
}

// ===== VIEW TOGGLES =====
class ViewToggles {
    constructor() {
        this.gridBtn = $('#viewGrid');
        this.listBtn = $('#viewList');
        this.mapBtn = $('#viewMap');

        this.gridView = $('#gridView');
        this.mapView = $('#mapView');

        if (!this.gridBtn) return;
        this.init();
    }

    init() {
        this.gridBtn.addEventListener('click', () => this.switchView('grid'));
        this.listBtn.addEventListener('click', () => this.switchView('list'));
        this.mapBtn.addEventListener('click', () => this.switchView('map'));
    }

    switchView(view) {
        $$('.view-toggle').forEach(btn => btn.classList.remove('active'));
        $$('.properties-view').forEach(v => v.classList.remove('active'));

        if (view === 'grid') {
            this.gridBtn.classList.add('active');
            this.gridView.classList.add('active');
        } else if (view === 'list') {
            this.listBtn.classList.add('active');
            this.gridView.classList.add('active'); // Reusing grid for now
        } else if (view === 'map') {
            this.mapBtn.classList.add('active');
            this.mapView.classList.add('active');
        }
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Shared components
    new HeaderController();
    new MobileMenu();

    // Page specific
    new HeroSlider();
    new PropertyManager(); // Handles fetching and rendering
    new ViewToggles();

    // Others...
    // Note: ScrollReveal and others can be re-enabled if needed
});
