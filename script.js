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

const normalizeStr = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

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
        this.toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        this.menu.querySelectorAll('.dropdown > a').forEach(a => {
            a.addEventListener('click', (e) => {
                if (window.innerWidth < 1024) {
                    e.preventDefault();
                    a.closest('.dropdown').classList.toggle('is-open');
                }
            });
        });

        this.menu.querySelectorAll('li:not(.dropdown) > a').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        document.addEventListener('click', (e) => {
            if (this.header && !this.header.contains(e.target)) {
                this.closeMenu();
            }
        });

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


// ===== PROPERTY DATA MANAGER =====
class PropertyManager {
    constructor() {
        this.properties = [];
        this.filteredProperties = [];
        this.container = $('#propertiesContainer');
        this.mapContainer = $('#catalogMap');
        this.map = null;
        this.markers = [];

        if (!this.container) return;
        this.init();
    }

    async init() {
        this._parseURLFilters();
        await this.loadProperties();
        this.setupFilters();
        this._syncSidebarToActiveFilters();
    }

    _parseURLFilters() {
        // Parse URL params once and store them. These are the AUTHORITATIVE initial filters.
        const p = new URLSearchParams(window.location.search);
        this.activeFilters = {
            tipo:      p.get('tipo')      || '',
            region:    p.get('region')    || '',
            comuna:    p.get('comuna')    || '',
            operacion: p.get('operacion') || '',
            precioMax: p.get('precio_max') ? parseInt(p.get('precio_max'), 10) : Infinity,
            precioMin: p.get('precio_min') ? parseInt(p.get('precio_min'), 10) : 0,
        };
        console.log('🔍 Active filters from URL:', JSON.stringify(this.activeFilters));
    }

    _syncSidebarToActiveFilters() {
        const f = this.activeFilters;
        // Tipo select
        if (f.tipo) {
            const el = document.querySelector('[name="tipo"]');
            if (el) {
                const opt = Array.from(el.options).find(o => normalizeStr(o.value) === normalizeStr(f.tipo));
                if (opt) opt.selected = true;
            }
        }
        // Precio max text input + slider
        if (f.precioMax !== Infinity) {
            const elText = document.querySelector('[name="precioMax"]');
            if (elText) elText.value = f.precioMax.toLocaleString('es-CL');
            const elSlider = document.querySelector('#priceMax');
            if (elSlider) elSlider.value = Math.min(f.precioMax, parseInt(elSlider.max, 10));
        }
        // Precio min text input + slider
        if (f.precioMin > 0) {
            const elText = document.querySelector('[name="precioMin"]');
            if (elText) elText.value = f.precioMin.toLocaleString('es-CL');
            const elSlider = document.querySelector('#priceMin');
            if (elSlider) elSlider.value = Math.max(f.precioMin, parseInt(elSlider.min, 10));
        }
        // Page title
        if (f.tipo) {
            const pageTitle = document.querySelector('.page-header h1, .page-header .page-title');
            if (pageTitle) {
                const labels = { casa: 'Casas', departamento: 'Departamentos', parcela: 'Parcelas', terreno: 'Terrenos', comercial: 'Locales Comerciales' };
                pageTitle.textContent = labels[f.tipo.toLowerCase()] || pageTitle.textContent;
            }
        }
    }


    async loadProperties() {
        try {
            const response = await fetch(CONFIG.dataFile);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            this.properties = await response.json();
            console.log(`✅ ${this.properties.length} propiedades cargadas desde JSON.`);
        } catch (error) {
            console.warn('⚠️ JSON no disponible, usando fallback:', error.message);
            this._loadFallback();
        }
        this.applyFilters();
        this.initMap();
    }

    _loadFallback() {
        const PH = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23E8E6E3'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='18' fill='%237A7A7A' text-anchor='middle' dy='.3em'%3ESin Imagen%3C/text%3E%3C/svg%3E`;
        this.properties = [
            { id: 9,  titulo: 'Casa en Venta – Sector Labranza', precioCLP: 70000000, operacion: 'venta', tipo: 'casa', region: 'La Araucanía', comuna: 'Labranza', dormitorios: 3, banos: 2, m2Utiles: 96, m2Terreno: 300, lat: -38.8120, lng: -72.6580, imagenPrincipal: PH, galeria: [], caracteristicas: ['estacionamiento','jardin'], destacada: true },
            { id: 10, titulo: 'Casa Regularizada – Villa Portal Alegría, Labranza', precioCLP: 70000000, operacion: 'venta', tipo: 'casa', region: 'La Araucanía', comuna: 'Labranza', dormitorios: 3, banos: 1, m2Utiles: 55, m2Terreno: 75, lat: -38.8200, lng: -72.6650, imagenPrincipal: PH, galeria: [], caracteristicas: ['termopanel','patio'], destacada: false },
            { id: 11, titulo: 'Casa en Venta – Lautaro', precioCLP: 0, operacion: 'venta', tipo: 'casa', region: 'La Araucanía', comuna: 'Lautaro', dormitorios: 3, banos: 1, m2Utiles: 80, m2Terreno: 200, lat: -38.5200, lng: -72.4400, imagenPrincipal: PH, galeria: [], caracteristicas: ['patio'], destacada: false },
            { id: 12, titulo: 'Departamento Exclusivo – Senador Estébanez, Temuco', precioCLP: 0, precioUF: 10500, operacion: 'venta', tipo: 'departamento', region: 'La Araucanía', comuna: 'Temuco', dormitorios: 3, banos: 4, m2Utiles: 160, lat: -38.7280, lng: -72.5750, imagenPrincipal: PH, galeria: [], caracteristicas: ['estacionamiento','bodega','terraza','quincho'], destacada: true },
            { id: 13, titulo: 'Departamento Remodelado – Avenida Alemania, Temuco', precioCLP: 125000000, operacion: 'venta', tipo: 'departamento', region: 'La Araucanía', comuna: 'Temuco', dormitorios: 1, banos: 1, m2Utiles: 60, lat: -38.7320, lng: -72.5800, imagenPrincipal: PH, galeria: [], caracteristicas: ['estacionamiento','terraza','calefaccion central'], destacada: false },
            { id: 14, titulo: 'Edificio Don Simón XII – Avenida Alemania, Temuco', precioCLP: 190000000, operacion: 'venta', tipo: 'departamento', region: 'La Araucanía', comuna: 'Temuco', dormitorios: 2, banos: 2, m2Utiles: 69, lat: -38.7310, lng: -72.5820, imagenPrincipal: PH, galeria: [], caracteristicas: ['estacionamiento','termopanel','piscina'], destacada: true },
            { id: 15, titulo: 'Parcela – Camino a Huichahue, Temuco', precioCLP: 55000000, operacion: 'venta', tipo: 'parcela', region: 'La Araucanía', comuna: 'Temuco', dormitorios: 0, banos: 0, m2Utiles: 0, m2Terreno: 5000, lat: -38.8500, lng: -72.5200, imagenPrincipal: PH, galeria: [], caracteristicas: ['agua pozo','rol propio'], destacada: false }
        ];
    }

    // Legacy alias
    useFallbackData() { this._loadFallback(); this.applyFilters(); this.initMap(); }

    renderProperties() {
        if (!this.container) return;
        this.container.innerHTML = '';
        this.updateResultsCount();

        if (this.filteredProperties.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'No se encontraron propiedades con esos filtros.';
            this.container.appendChild(noResults);
            return;
        }

        const PLACEHOLDER_IMG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23E8E6E3'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='18' fill='%237A7A7A' text-anchor='middle' dy='.3em'%3ESin Imagen%3C/text%3E%3C/svg%3E`;

        this.filteredProperties.forEach(prop => {
            const card = document.createElement('article');
            card.className = 'property-card-catalog';
            // NO usar data-fade-up: el observer no re-observa cards dinámicas → quedan opacity:0

            const imgUrl = prop.imagenPrincipal || PLACEHOLDER_IMG;

            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'property-image-wrapper';
            imgWrapper.style.cssText = 'position:relative;overflow:hidden;height:240px;';

            const imgLink = document.createElement('a');
            imgLink.href = `propiedad-detalle.html?id=${Number(prop.id)}`;
            imgLink.style.cssText = 'display:block;height:100%;width:100%;';
            const imgDiv = document.createElement('div');
            imgDiv.className = 'property-image';
            imgDiv.style.cssText = 'background-size:cover;background-position:center;width:100%;height:100%;';
            imgDiv.style.backgroundImage = `url('${imgUrl}')`;
            imgLink.appendChild(imgDiv);
            imgWrapper.appendChild(imgLink);

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
            if (prop.precioCLP && prop.precioCLP > 0) {
                price.textContent = formatCurrency(prop.precioCLP);
            } else if (prop.precioUF) {
                price.textContent = `UF ${prop.precioUF.toLocaleString('es-CL')}`;
            } else {
                price.textContent = 'Consultar precio';
                price.style.color = '#FF6B35';
            }

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
            detailLink.style.cssText = 'opacity:1;transform:none;';
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
        $$('.property-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                btn.classList.toggle('active');
                const icon = btn.querySelector('path');
                if (icon) icon.setAttribute('fill', btn.classList.contains('active') ? 'currentColor' : 'none');
            });
        });
    }

    initMap() {
        if (!this.mapContainer || typeof L === 'undefined') return;
        this.map = L.map('catalogMap').setView([-38.7359, -72.5904], 12);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(this.map);
        this.updateMapMarkers();
        const mapTabBtn = $('#viewMap');
        if (mapTabBtn) {
            mapTabBtn.addEventListener('click', () => setTimeout(() => this.map.invalidateSize(), 100));
        }
    }

    updateMapMarkers() {
        if (!this.map) return;
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
        this.filteredProperties.forEach(prop => {
            if (prop.lat && prop.lng) {
                const icon = L.divIcon({
                    className: 'custom-pin',
                    html: `<div style="background-color:var(--orange-primary);width:24px;height:24px;border-radius:50%;border:2px solid white;box-shadow:0 4px 8px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
                const marker = L.marker([prop.lat, prop.lng], { icon })
                    .bindPopup(`
                        <div style="width:200px;">
                            <div style="height:120px;background-image:url('${prop.imagenPrincipal || ''}');background-size:cover;border-radius:8px;margin-bottom:8px;"></div>
                            <b>${formatCurrency(prop.precioCLP)}</b><br>
                            ${prop.titulo}
                            <a href="propiedad-detalle.html?id=${prop.id}" style="display:block;margin-top:8px;color:var(--orange-primary);font-weight:600;">Ver Ficha</a>
                        </div>
                    `);
                marker.addTo(this.map);
                this.markers.push(marker);
            }
        });
    }

    setupFilters() {
        // ── "Aplicar Filtros" button & Reset ──────────────────────────────────
        const applyBtn = document.querySelector('#catalogSidebar .btn-primary');
        const resetBtn = document.querySelector('#resetFilters');
        applyBtn?.addEventListener('click', () => this.applyFilters());
        resetBtn?.addEventListener('click', () => this.resetFilters());

        // ── Mobile sidebar toggle ──────────────────────────────────────────────
        const toggleBtn = document.querySelector('#toggleSidebar');
        const sidebar   = document.querySelector('#catalogSidebar');
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                toggleBtn.classList.toggle('active');
            });
        }

        // ── Price range double-slider ──────────────────────────────────────────
        const sliderMin  = document.querySelector('#priceMin');
        const sliderMax  = document.querySelector('#priceMax');
        const inputMin   = document.querySelector('[name="precioMin"]');
        const inputMax   = document.querySelector('[name="precioMax"]');
        const sliderWrap = document.querySelector('.price-range-slider');

        const updateSliderTrack = () => {
            if (!sliderMin || !sliderMax || !sliderWrap) return;
            const min  = parseInt(sliderMin.min, 10)  || 0;
            const max  = parseInt(sliderMax.max, 10)  || 500000000;
            const low  = parseInt(sliderMin.value, 10);
            const high = parseInt(sliderMax.value, 10);
            const pLow  = ((low  - min) / (max - min)) * 100;
            const pHigh = ((high - min) / (max - min)) * 100;
            // Paint the filled track between the two thumbs
            sliderWrap.style.setProperty('--range-low',  `${pLow}%`);
            sliderWrap.style.setProperty('--range-high', `${pHigh}%`);
        };

        if (sliderMin && sliderMax) {
            sliderMin.addEventListener('input', () => {
                // Prevent crossing
                if (parseInt(sliderMin.value) > parseInt(sliderMax.value)) {
                    sliderMin.value = sliderMax.value;
                }
                if (inputMin) inputMin.value = parseInt(sliderMin.value).toLocaleString('es-CL');
                updateSliderTrack();
                this.applyFilters();
            });

            sliderMax.addEventListener('input', () => {
                if (parseInt(sliderMax.value) < parseInt(sliderMin.value)) {
                    sliderMax.value = sliderMin.value;
                }
                if (inputMax) inputMax.value = parseInt(sliderMax.value).toLocaleString('es-CL');
                updateSliderTrack();
                this.applyFilters();
            });

            // Also sync text inputs → sliders when user types
            inputMin?.addEventListener('change', () => {
                const raw = parseInt(inputMin.value.replace(/\D/g, ''), 10) || 0;
                sliderMin.value = Math.min(raw, parseInt(sliderMax.value));
                inputMin.value  = parseInt(sliderMin.value).toLocaleString('es-CL');
                updateSliderTrack();
                this.applyFilters();
            });
            inputMax?.addEventListener('change', () => {
                const raw = parseInt(inputMax.value.replace(/\D/g, ''), 10) || parseInt(sliderMax.max);
                sliderMax.value = Math.max(raw, parseInt(sliderMin.value));
                inputMax.value  = parseInt(sliderMax.value).toLocaleString('es-CL');
                updateSliderTrack();
                this.applyFilters();
            });

            updateSliderTrack(); // initial paint
        }

        // ── Operacion radio ────────────────────────────────────────────────────
        document.querySelectorAll('[name="operacion"]').forEach(radio => {
            radio.addEventListener('change', () => this.applyFilters());
        });

        // ── Tipo / Región / Comuna selects ────────────────────────────────────
        document.querySelectorAll('select[name="tipo"], select[name="region"], select[name="comuna"]').forEach(sel => {
            sel.addEventListener('change', () => this.applyFilters());
        });

        // ── Dormitorios / Baños number buttons ────────────────────────────────
        document.querySelectorAll('.number-selector').forEach(selector => {
            selector.querySelectorAll('.number-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const wasActive = btn.classList.contains('active');
                    selector.querySelectorAll('.number-btn').forEach(b => b.classList.remove('active'));
                    if (!wasActive) btn.classList.add('active'); // toggle off if same clicked
                    this.applyFilters();
                });
            });
        });

        // ── Superficie inputs ────────────────────────────────────────────────
        document.querySelectorAll('[name="superficieMin"], [name="superficieMax"]').forEach(el => {
            el.addEventListener('change', () => this.applyFilters());
        });

        // ── Características checkboxes ────────────────────────────────────────
        document.querySelectorAll('[name="caracteristica"]').forEach(cb => {
            cb.addEventListener('change', () => this.applyFilters());
        });
    }

    applyFilters() {
        // ── Leer estado actual del DOM ──────────────────────────────────────────
        // Operación: radio seleccionado (si hay alguno)
        const radioOp = document.querySelector('[name="operacion"]:checked');
        const operacion = normalizeStr(radioOp ? radioOp.value : '');

        // Tipo de propiedad
        const tipoEl = document.querySelector('[name="tipo"]');
        const tipo = normalizeStr(tipoEl?.value || '');

        // Región / Comuna
        const regionEl = document.querySelector('[name="region"]');
        const region = normalizeStr(regionEl?.value || '');
        const comunaEl = document.querySelector('[name="comuna"]');
        const comuna = normalizeStr(comunaEl?.value || '');

        // Precio (slider range)
        const sliderMin = document.querySelector('#priceMin');
        const sliderMax = document.querySelector('#priceMax');
        const precioMin = sliderMin ? parseInt(sliderMin.value, 10) : 0;
        const precioMax = sliderMax ? parseInt(sliderMax.value, 10) : Infinity;
        const isMaxDefault = sliderMax ? parseInt(sliderMax.value, 10) >= parseInt(sliderMax.max, 10) : true;

        // Dormitorios / Baños
        const dormBtn = document.querySelector('.number-selector:nth-child(1) .number-btn.active, [data-filter-dorm] .number-btn.active');
        const dormMin = dormBtn ? parseInt(dormBtn.dataset.value, 10) : 0;
        const banosBtn = document.querySelector('.number-selector:nth-child(2) .number-btn.active, [data-filter-banos] .number-btn.active');
        const banosMin = banosBtn ? parseInt(banosBtn.dataset.value, 10) : 0;

        // Características
        const caracChecked = Array.from(document.querySelectorAll('[name="caracteristica"]:checked'))
            .map(cb => normalizeStr(cb.value));

        console.log(`🔎 Filtros → op:${operacion||'todos'} tipo:${tipo||'todos'} region:${region||'todas'} precioMin:${precioMin} precioMax:${isMaxDefault?'∞':precioMax}`);

        this.filteredProperties = this.properties.filter(p => {
            // Operación
            if (operacion && normalizeStr(p.operacion) !== operacion) return false;
            // Tipo
            if (tipo && normalizeStr(p.tipo) !== tipo) return false;
            // Región
            if (region && normalizeStr(p.region) !== region) return false;
            // Comuna
            if (comuna && normalizeStr(p.comuna) !== comuna) return false;
            // Dormitorios
            if (dormMin > 0 && (p.dormitorios || 0) < dormMin) return false;
            // Baños
            if (banosMin > 0 && (p.banos || 0) < banosMin) return false;
            // Precio mínimo del slider
            if (precioMin > 0 && (p.precioCLP || p.precioUF || 0) < precioMin) return false;
            // Precio máximo (solo si no está en el valor máximo default)
            if (!isMaxDefault && (p.precioCLP || 0) > precioMax) return false;
            // Características
            if (caracChecked.length > 0) {
                const pCarac = (p.caracteristicas || []).map(c => normalizeStr(c));
                if (!caracChecked.every(c => pCarac.includes(c))) return false;
            }
            return true;
        });

        this.renderProperties();
        this.updateResultsCount();
        if (this.map) this.updateMapMarkers();
    }

    resetFilters() {
        // Reiniciar selects
        document.querySelectorAll('.filter-select').forEach(s => { s.selectedIndex = 0; });
        // Reiniciar inputs de texto/precio
        document.querySelectorAll('.filter-input').forEach(i => { i.value = ''; });
        // Reiniciar radio de operación al primero
        const firstRadio = document.querySelector('[name="operacion"]');
        if (firstRadio) firstRadio.checked = true;
        // Reiniciar sliders de precio al max
        const sMax = document.querySelector('#priceMax');
        const sMin = document.querySelector('#priceMin');
        if (sMax) sMax.value = sMax.max;
        if (sMin) sMin.value = sMin.min;
        // Reiniciar botones de número
        document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('active'));
        // Reiniciar checkboxes
        document.querySelectorAll('[name="caracteristica"]').forEach(c => { c.checked = false; });
        // Limpiar URL y aplicar
        window.history.replaceState({}, '', window.location.pathname);
        this.applyFilters();
    }
}


// ===== HERO SLIDER =====
class HeroSlider {
    constructor() {
        this.slider = $('#heroSlider');
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
        if (this.dots[this.currentSlide]) this.dots[this.currentSlide].classList.remove('active');
        this.currentSlide = index;
        this.slides[this.currentSlide].classList.add('active');
        if (this.dots[this.currentSlide]) this.dots[this.currentSlide].classList.add('active');
    }

    next() { this.goToSlide((this.currentSlide + 1) % this.slides.length); }
    prev() { this.goToSlide((this.currentSlide - 1 + this.slides.length) % this.slides.length); }
    startAutoplay() { this.autoplayInterval = setInterval(() => this.next(), CONFIG.heroSlideInterval); }
    stopAutoplay() { clearInterval(this.autoplayInterval); }
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
        this.listBtn?.addEventListener('click', () => this.switchView('list'));
        this.mapBtn?.addEventListener('click', () => this.switchView('map'));
    }

    switchView(view) {
        $$('.view-toggle').forEach(btn => btn.classList.remove('active'));
        $$('.properties-view').forEach(v => v.classList.remove('active'));
        if (view === 'grid') {
            this.gridBtn.classList.add('active');
            this.gridView?.classList.add('active');
        } else if (view === 'list') {
            this.listBtn?.classList.add('active');
            this.gridView?.classList.add('active');
        } else if (view === 'map') {
            this.mapBtn?.classList.add('active');
            this.mapView?.classList.add('active');
        }
    }
}

// ===== CHILE REGIONS DATA =====
const CHILE_REGIONS = [
    { nombre: 'Arica y Parinacota', comunas: ['Arica', 'Camarones', 'Putre', 'General Lagos'] },
    { nombre: 'Tarapacá', comunas: ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Camiña', 'Colchane', 'Huara', 'Pica'] },
    { nombre: 'Antofagasta', comunas: ['Antofagasta', 'Mejillones', 'Sierra Gorda', 'Taltal', 'Calama', 'Ollagüe', 'San Pedro de Atacama', 'Tocopilla', 'María Elena'] },
    { nombre: 'Atacama', comunas: ['Copiapó', 'Caldera', 'Tierra Amarilla', 'Chañaral', 'Diego de Almagro', 'Vallenar', 'Alto del Carmen', 'Freirina', 'Huasco'] },
    { nombre: 'Coquimbo', comunas: ['La Serena', 'Coquimbo', 'Andacollo', 'La Higuera', 'Paihuano', 'Vicuña', 'Illapel', 'Canela', 'Los Vilos', 'Salamanca', 'Ovalle', 'Combarbalá', 'Monte Patria', 'Punitaqui', 'Río Hurtado'] },
    { nombre: 'Valparaíso', comunas: ['Valparaíso', 'Casablanca', 'Concón', 'Juan Fernández', 'Puchuncaví', 'Quintero', 'Viña del Mar', 'Isla de Pascua', 'Los Andes', 'Calle Larga', 'Rinconada', 'San Esteban', 'La Ligua', 'Cabildo', 'Papudo', 'Petorca', 'Zapallar', 'Quillota', 'Calera', 'Hijuelas', 'La Cruz', 'Nogales', 'San Antonio', 'Algarrobo', 'Cartagena', 'El Quisco', 'El Tabo', 'Santo Domingo', 'San Felipe', 'Catemu', 'Llaillay', 'Panquehue', 'Putaendo', 'Santa María', 'Quilpué', 'Limache', 'Olmué', 'Villa Alemana'] },
    { nombre: 'Metropolitana de Santiago', comunas: ['Santiago', 'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central', 'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén', 'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Joaquín', 'San Miguel', 'San Ramón', 'Vitacura', 'Puente Alto', 'Pirque', 'San José de Maipo', 'Colina', 'Lampa', 'Tiltil', 'San Bernardo', 'Buin', 'Calera de Tango', 'Paine', 'Melipilla', 'Alhué', 'Curacaví', 'María Pinto', 'San Pedro', 'Talagante', 'El Monte', 'Isla de Maipo', 'Padre Hurtado', 'Peñaflor'] },
    { nombre: "Libertador Gral. Bernardo O'Higgins", comunas: ['Rancagua', 'Codegua', 'Coinco', 'Coltauco', 'Doñihue', 'Graneros', 'Las Cabras', 'Machalí', 'Malloa', 'Mostazal', 'Olivar', 'Peumo', 'Pichidegua', 'Quinta de Tilcoco', 'Rengo', 'Requínoa', 'San Vicente', 'Pichilemu', 'La Estrella', 'Litueche', 'Marchihue', 'Navidad', 'Paredones', 'San Fernando', 'Chépica', 'Chimbarongo', 'Lolol', 'Nancagua', 'Palmilla', 'Peralillo', 'Placilla', 'Pumanque', 'Santa Cruz'] },
    { nombre: 'Maule', comunas: ['Talca', 'Constitución', 'Curepto', 'Empedrado', 'Maule', 'Pelarco', 'Pencahue', 'Río Claro', 'San Clemente', 'San Rafael', 'Cauquenes', 'Chanco', 'Pelluhue', 'Curicó', 'Hualañé', 'Licantén', 'Molina', 'Rauco', 'Romeral', 'Sagrada Familia', 'Teno', 'Vichuquén', 'Linares', 'Colbún', 'Longaví', 'Parral', 'Retiro', 'San Javier', 'Villa Alegre', 'Yerbas Buenas'] },
    { nombre: 'Ñuble', comunas: ['Cobquecura', 'Coelemu', 'Ninhue', 'Portezuelo', 'Quirihue', 'Ránquil', 'Treguaco', 'Bulnes', 'Chillán Viejo', 'Chillán', 'El Carmen', 'Pemuco', 'Pinto', 'Quillón', 'San Ignacio', 'Yungay', 'Coihueco', 'Ñiquén', 'San Carlos', 'San Fabián', 'San Nicolás'] },
    { nombre: 'Biobío', comunas: ['Concepción', 'Coronel', 'Chiguayante', 'Florida', 'Hualqui', 'Lota', 'Penco', 'San Pedro de la Paz', 'Santa Juana', 'Talcahuano', 'Tomé', 'Hualpén', 'Lebu', 'Arauco', 'Cañete', 'Contulmo', 'Curanilahue', 'Los Álamos', 'Tirúa', 'Los Ángeles', 'Antuco', 'Cabrero', 'Laja', 'Mulchén', 'Nacimiento', 'Negrete', 'Quilaco', 'Quilleco', 'San Rosendo', 'Santa Bárbara', 'Tucapel', 'Yumbel', 'Alto Biobío'] },
    { nombre: 'La Araucanía', comunas: ['Temuco', 'Carahue', 'Cunco', 'Curarrehue', 'Freire', 'Galvarino', 'Gorbea', 'Lautaro', 'Loncoche', 'Melipeuco', 'Nueva Imperial', 'Padre las Casas', 'Perquenco', 'Pitrufquén', 'Pucón', 'Saavedra', 'Teodoro Schmidt', 'Toltén', 'Vilcún', 'Villarrica', 'Cholchol', 'Angol', 'Collipulli', 'Curacautín', 'Ercilla', 'Lonquimay', 'Los Sauces', 'Lumaco', 'Purén', 'Renaico', 'Traiguén', 'Victoria'] },
    { nombre: 'Los Ríos', comunas: ['Valdivia', 'Corral', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina', 'Paillaco', 'Panguipulli', 'La Unión', 'Futrono', 'Lago Ranco', 'Río Bueno'] },
    { nombre: 'Los Lagos', comunas: ['Puerto Montt', 'Calbuco', 'Cochamó', 'Fresia', 'Frutillar', 'Los Muermos', 'Llanquihue', 'Maullín', 'Puerto Varas', 'Castro', 'Ancud', 'Chonchi', 'Curaco de Vélez', 'Dalcahue', 'Puqueldón', 'Queilén', 'Quellón', 'Quemchi', 'Quinchao', 'Osorno', 'Puerto Octay', 'Purranque', 'Puyehue', 'Río Negro', 'San Juan de la Costa', 'San Pablo', 'Chaitén', 'Futaleufú', 'Hualaihué', 'Palena'] },
    { nombre: 'Aysén', comunas: ['Coihaique', 'Lago Verde', 'Aysén', 'Cisnes', 'Guaitecas', 'Cochrane', "O'Higgins", 'Tortel', 'Chile Chico', 'Río Ibáñez'] },
    { nombre: 'Magallanes', comunas: ['Punta Arenas', 'Laguna Blanca', 'Río Verde', 'San Gregorio', 'Cabo de Hornos', 'Antártica', 'Porvenir', 'Primavera', 'Timaukel', 'Natales', 'Torres del Paine'] }
];

// ===== SEARCH FORM CONTROLLER =====
class SearchFormController {
    constructor() {
        this.form = $('#searchForm');
        this.operacionInput = $('#operacionInput');
        this.regionSelect = $('#regionSelect') || document.querySelector('select[name="region"]');
        this.comunaSelect = $('#comunaSelect') || document.querySelector('select[name="comuna"]');
        this.precioInput = $('#precioInput');
        this.submitBtn = $('#searchSubmitBtn');
        this.tabs = $$('.search-tab-btn');

        if (!this.form && !this.regionSelect) return;
        this.init();
    }

    async init() {
        if (this.form) {
            this.setupTabs();
            this.setupCurrencyFormat();
            this.setupFormSubmit();
        }
        this.loadRegions();

        // Siempre enlazar el cambio de región para actualizar comunas
        if (this.regionSelect) {
            this.regionSelect.addEventListener('change', () => {
                this.updateComunasFromSelect();
                // En página de catálogo también filtra en tiempo real
                if (!this.form && window.propertyManager) {
                    window.propertyManager.applyFilters();
                }
            });
        }
        // En catálogo: también filtrar al cambiar comuna
        if (!this.form && this.comunaSelect) {
            this.comunaSelect.addEventListener('change', () => {
                if (window.propertyManager) window.propertyManager.applyFilters();
            });
        }
    }

    loadRegions() {
        if (!this.regionSelect) return;

        const params = new URLSearchParams(window.location.search);
        const urlRegion = params.get('region');
        const urlComuna = params.get('comuna');

        // Populate region select
        this.regionSelect.innerHTML = '<option value="">Todas las regiones</option>';
        let preselectedRegionIndex = -1;

        CHILE_REGIONS.forEach((region, index) => {
            const option = document.createElement('option');
            option.value = region.nombre;
            option.dataset.index = index;
            option.textContent = region.nombre;
            if (urlRegion && normalizeStr(urlRegion) === normalizeStr(region.nombre)) {
                option.selected = true;
                preselectedRegionIndex = index;
            }
            this.regionSelect.appendChild(option);
        });

        // Populate comunas if region was pre-selected
        if (preselectedRegionIndex >= 0) {
            this.populateComunas(preselectedRegionIndex, urlComuna);
        }
        // Do NOT call applyFilters() here — PropertyManager.applyURLParams() handles it
        // after it has loaded the properties data.
    }

    populateComunas(regionIndex, preselectedComuna) {
        if (!this.comunaSelect) return;
        const region = CHILE_REGIONS[regionIndex];
        if (!region) return;

        this.comunaSelect.innerHTML = '<option value="">Todas las comunas</option>';
        region.comunas.forEach(c => {
            const option = document.createElement('option');
            option.value = c;
            option.textContent = c;
            if (preselectedComuna && normalizeStr(preselectedComuna) === normalizeStr(c)) {
                option.selected = true;
            }
            this.comunaSelect.appendChild(option);
        });
        this.comunaSelect.disabled = false;
    }

    updateComunasFromSelect() {
        if (!this.regionSelect || !this.comunaSelect) return;
        const selectedOption = this.regionSelect.options[this.regionSelect.selectedIndex];
        const indexStr = selectedOption?.dataset?.index;

        if (indexStr === undefined || indexStr === '') {
            this.comunaSelect.innerHTML = '<option value="">Todas las comunas</option>';
            this.comunaSelect.disabled = true;
            return;
        }
        this.populateComunas(parseInt(indexStr, 10), null);
    }

    setupTabs() {
        if (!this.tabs.length) return;
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.tabs.forEach(t => {
                    t.classList.remove('active', 'bg-orange-primary', 'text-white');
                    t.classList.add('bg-gray-100', 'text-gray-700');
                });
                tab.classList.remove('bg-gray-100', 'text-gray-700');
                tab.classList.add('active', 'bg-orange-primary', 'text-white');

                const operacion = tab.dataset.tab === 'arrendar' ? 'arriendo' : 'venta';
                if (this.operacionInput) this.operacionInput.value = operacion;

                if (this.precioInput) {
                    const label = $('#precioLabel');
                    if (operacion === 'arriendo') {
                        this.precioInput.placeholder = 'Ej: 500.000';
                        if (label) label.textContent = 'Presupuesto Mensual';
                    } else {
                        this.precioInput.placeholder = 'Ej: 80.000.000';
                        if (label) label.textContent = 'Presupuesto Máx';
                    }
                }
            });
        });
    }

    setupCurrencyFormat() {
        $$('.format-currency').forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value !== '') value = parseInt(value, 10).toLocaleString('es-CL');
                e.target.value = value;
            });
        });
    }

    setupFormSubmit() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Strip currency formatting dots before submit
            if (this.precioInput && this.precioInput.value) {
                this.precioInput.value = this.precioInput.value.replace(/\./g, '');
            }

            // Disable blank fields to keep URL clean
            this.form.querySelectorAll('input, select').forEach(input => {
                if (!input.value || input.value === 'Todas las regiones' || input.value === 'Todas las comunas') {
                    input.disabled = true;
                }
            });

            // Loading state
            if (this.submitBtn) {
                const content = this.submitBtn.querySelector('.btn-content');
                const spinner = this.submitBtn.querySelector('.loading-spinner');
                if (content) content.classList.add('opacity-0');
                if (spinner) spinner.classList.remove('opacity-0');
                this.submitBtn.classList.add('cursor-wait');
                this.submitBtn.disabled = true;
            }

            setTimeout(() => this.form.submit(), 300);
        });
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    new HeaderController();
    new MobileMenu();

    // Init PropertyManager first (loads data), then SearchFormController (populates selects + triggers filter)
    window.propertyManager = new PropertyManager();
    new SearchFormController();

    new HeroSlider();
    new ViewToggles();
});
