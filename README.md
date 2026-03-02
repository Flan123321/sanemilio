# SAN EMILIO PROPIEDADES
## Plataforma Inmobiliaria Premium - Multipágina

---

## 🎯 Visión del Proyecto

**San Emilio Propiedades** no es una landing page común. Es una **plataforma inmobiliaria completa** que equilibra dos conceptos clave:

1. **Seriedad Profesional**: Transmite certeza jurídica, experiencia, solidez y exclusividad
2. **Simpatía y Calidez**: Acogedora, humana y accesible, alejándose de la frialdad corporativa

---

## 🎨 Identidad Visual Renovada

### Paleta de Colores Premium

```
AZUL MARINO PROFUNDO (Autoridad & Seriedad)
--navy-900: #0B1A2E  (Fondo principal oscuro)
--navy-800: #152844  (Variante media)
--navy-700: #1F3654  (Gradientes)
--navy-600: #2C4A6E  (Gradientes claros)

NARANJA VIBRANTE (Calidez & Energía) - SOLO ACENTOS
--orange-primary: #FF6B35  (CTAs principales)
--orange-light: #FF8A5C    (Hover states)
--orange-dark: #E65528     (Pressed states)

CREMA & GRIS PERLA (Iluminación & Fondos)
--cream-bg: #F8F5F0        (Fondo principal claro)
--cream-light: #FFFBF5     (Secciones alternadas)
--pearl-gray: #E8E6E3      (Separadores)
--pearl-dark: #D4D2CF      (Bordes)
```

### Tipografía Sofisticada

**Serif Moderna (Títulos grandes - Seriedad)**
- **Playfair Display** (600, 700): Para headlines que transmitan elegancia y autoridad

**Sans-Serif Geométrica (Textos - Legibilidad)**
- **Montserrat** (300-700): Para navegación, cuerpos de texto y elementos UI

---

## 🏗️ Estructura Multipágina

### 1. **Página de Inicio (index.html)**

#### Hero Section
- ✅ **Slider de video cinemático lento** (3 slides con transición suave)
- ✅ Título impactante pero empático: *"Más que propiedades, encontramos tu próximo hogar en la Araucanía"*
- ✅ **Buscador inteligente integrado** (no solo un botón)
  - Tabs: Comprar / Arrendar
  - Campos: Tipo, Ubicación, Rango de Precio
  - Búsqueda instantánea

#### Secciones
1. **Propiedades Destacadas** - Grid elegante de 6 propiedades
2. **Por Qué Nosotros** - 3 pilares de confianza:
   - Certeza Jurídica
   - Valoración de Mercado Real
   - Acompañamiento Personalizado
3. **Testimonios Reales** - Carrusel automático con clientes reales
4. **CTA Final** - Llamado a la acción con botones duales

### 2. **Catálogo de Propiedades (propiedades.html)**

#### Características Principales
- ✅ **Barra lateral de filtros avanzada**:
  - Operación (Venta/Arriendo)
  - Tipo de propiedad
  - Ubicación (comuna)
  - Rango de precio con sliders
  - Dormitorios / Baños (selectores numéricos)
  - Superficie (m²)
  - Características (checkboxes)

- ✅ **Vista Dual**:
  - Grid View (default)
  - List View
  - Map View (con placeholder para Google Maps/Mapbox)

- ✅ **Toolbar Completo**:
  - Contador de resultados
  - Ordenamiento (Recientes, Precio, Superficie)
  - Toggle de vistas

- ✅ **Paginación Profesional**

### 3. **Otras Páginas** (Para Implementar)

- `nosotros.html` - Historia del equipo con fotos profesionales y biografías
- `servicios.html` - Servicios detallados
- `blog.html` - Noticias y artículos del mercado inmobiliario
- `contacto.html` - Formulario + mapa + datos de contacto
- `propiedad-detalle.html` - Vista individual de propiedad

---

## ✨ Interacciones y Animaciones

### Filosofía: **Sutileza Profesional**

❌ **Eliminado**: Efectos futuristas, movimientos bruscos, animaciones llamativas
✅ **Implementado**: Micro-interacciones elegantes y delicadas

#### Efectos Específicos

1. **Zoom Lento en Propiedades**
   - Al pasar el mouse, la imagen hace zoom muy gradual (escala 1.06)
   - Aparece botón naranja "Ver Detalles" con fade-in suave
   - Toda la tarjeta se eleva sutilmente (-8px)

2. **Transiciones Suaves tipo Fade-In**
   - Elementos aparecen con opacidad gradual al hacer scroll
   - Threshold: 15% del elemento visible
   - Duración: 0.8s con easing profesional

3. **Hero Slider Cinemático**
   - Transición entre slides: 1.2s de fade
   - Auto-play cada 6 segundos
   - Efecto "slow zoom" en el fondo (20s loop)

4. **Hover States Refinados**
   - Botones: Elevación de -2px + sombra sutil
   - Links: Underline animado de izquierda a derecha
   - Cards: Transform suave sin brusquedad

---

## 📸 Estilo Fotográfico Requerido

### Especificaciones para Fotografía Real

Cuando se agreguen imágenes reales, deben cumplir:

1. **Fotografía de Arquitectura de Alta Gama**
   - Iluminación cálida (Golden Hour preferiblemente)
   - Composiciones profesionales con líneas limpias

2. **Mostrando "Vida"**
   - ✅ Mesa puesta con elementos decorativos
   - ✅ Chimenea encendida en propiedades con quincho
   - ✅ Agentes reales interactuando con clientes sonrientes
   - ❌ NO usar fotos de stock genéricas
   - ❌ NO mostrar espacios completamente vacíos

3. **Entornos Reales**
   - Propiedades auténticas de Temuco y La Araucanía
   - Paisajes locales (volcanes, bosques, lagos)
   - Contexto urbano de la región

---

## 🚀 Cómo Usar

### Opción 1: Servidor Local (Recomendado)

**Con Python:**
```powershell
cd "c:\Users\figue\OneDrive\Escritorio\SAN EMILIO"
python -m http.server 8000
```
Abrir: `http://localhost:8000`

**Con Node.js:**
```powershell
npx -y http-server -p 8000
```
Abrir: `http://localhost:8000`

**Con VS Code Live Server:**
1. Instalar extensión "Live Server"
2. Click derecho en `index.html`
3. "Open with Live Server"

### Opción 2: Abrir Directamente
Doble click en `index.html`

---

## 📁 Estructura de Archivos

```
SAN EMILIO/
│
├── index.html           # Página de Inicio
├── propiedades.html     # Catálogo con Filtros
├── styles.css           # CSS Principal (Completo)
├── script.js            # JavaScript Modular
└── README.md            # Esta documentación

├── (Por Implementar)
├── nosotros.html        # Historia y Equipo
├── servicios.html       # Servicios Detallados
├── blog.html            # Noticias
├── contacto.html        # Contacto + Mapa
└── propiedad-detalle.html  # Vista Individual
```

---

## 🎨 Componentes UI Implementados

### Navegación
- [x] Header global con dropdown menus
- [x] Logo con icon + texto dual
- [x] Sticky navbar con efecto scroll
- [x] Mobile hamburger menu
- [x] CTAs destacados en naranja

### Hero
- [x] Slider cinemático de 3 slides
- [x] Controles de navegación (flechas + dots)
- [x] Autoplay con pause en hover
- [x] Buscador inteligente integrado
- [x] Tabs de operación (Comprar/Arrendar)

### Property Cards
- [x] Grid responsivo
- [x] Badges (Exclusiva, Nueva, Oportunidad)
- [x] Botón favorito con toggle
- [x] Hover con zoom lento de imagen
- [x] Botón "Ver Detalles" con fade-in
- [x] Features con iconos SVG limpios

### Filtros (Catálogo)
- [x] Sidebar sticky con scroll
- [x] Radio buttons estilizados
- [x] Selectores custom
- [x] Number selectors (Dorms/Baños)
- [x] Price range sliders
- [x] Checkboxes para características
- [x] Botón "Limpiar" filtros

### Otros
- [x] Testimonials carousel automático
- [x] Pilares de confianza (3 columnas)
- [x] Footer completo con navegación
- [x] Breadcrumb navigation
- [x] Paginación con ... dots
- [x] View toggles (Grid/List/Map)

---

## 🎯 Principios de Diseño

### Equilibrio Seriedad-Simpatía

| **Elemento** | **Seriedad** | **Simpatía** |
|--------------|--------------|--------------|
| **Colores** | Navy profundo | Naranja cálido en acentos |
| **Tipografía** | Playfair Display (Serif) | Montserrat (Sans-serif) |
| **Bordes** | Líneas limpias | Bordes redondeados sutiles |
| **Sombras** | Sombras profesionales | Elevaciones suaves |
| **Espaciado** | Generoso y ordenado | Breathing room |
| **Fotos** | Alta calidad técnica | Mostrando vida y calidez |

### Micro-Interacciones

1. **Sutileza ante todo**: Nada instantáneo, todo gradual
2. **Timing perfecto**: 0.4s para la mayoría de transiciones
3. **Easing natural**: `cubic-bezier(0.4, 0, 0.2, 1)`
4. **Estados claros**: Hover, Active, Focus bien definidos

---

## 📊 Performance

### Optimizaciones Implementadas

- ✅ **CSS Puro**: Sin frameworks pesados (TailwindCSS, Bootstrap)
- ✅ **JavaScript Modular**: Classes ES6, lazy loading ready
- ✅ **Debouncing**: En scroll events (100ms)
- ✅ **IntersectionObserver**: Para scroll reveals
- ✅ **Autoplay inteligente**: Pause en hover, resume en leave
- ✅ **Core Web Vitals Monitoring**: LCP, FID tracking

### Métricas Objetivo

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- Lighthouse Score: > 90

---

## 🔧 Customización Rápida

### Cambiar Colores de Acento

Editar variables en `styles.css` (líneas 8-17):
```css
--orange-primary: #TU_COLOR_AQUI;
--orange-light: #TU_COLOR_CLARO;
--orange-dark: #TU_COLOR_OSCURO;
```

### Ajustar Timing de Animaciones

```css
--transition-base: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 0.6s cubic-bezier(0.4, 0, 0.2, 1);
```

### Modificar Tipografía

Cambiar imports en `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=TU_FUENTE:wght@...&display=swap" rel="stylesheet">
```

Y variables CSS:
```css
--font-serif: 'Tu Fuente Serif', Georgia, serif;
--font-sans: 'Tu Fuente Sans', sans-serif;
```

---

## 📱 Responsive Design

### Breakpoints

```css
Mobile:   < 768px   (1 columna, menú hamburguesa)
Tablet:   768-1024px (2 columnas, sidebar colapsable)
Desktop:  > 1024px   (3+ columnas, sidebar sticky)
```

### Adaptaciones Móviles

- Navegación inferior tipo app (implementable)
- Sidebar de filtros colapsable con botón
- Grid de 1 columna para propiedades
- Buscador con campos apilados verticalmente
- Footer simplificado (1 columna)

---

## 🚧 Próximos Pasos

### Fase 1: Completar Páginas
- [ ] `nosotros.html` - Con fotos del equipo real
- [ ] `servicios.html` - Listado detallado
- [ ] `contacto.html` - Formulario + Google Maps
- [ ] `propiedad-detalle.html` - Galería + info completa

### Fase 2: Integración Real
- [ ] **Fotografía Profesional**: Contratar fotógrafo de arquitectura
- [ ] **Base de Datos**: API para propiedades reales
- [ ] **CRM**: Sistema de gestión de leads
- [ ] **Mapa Interactivo**: Google Maps o Mapbox API

### Fase 3: Optimización
- [ ] **Imágenes Optimizadas**: WebP, lazy loading, CDN
- [ ] **SEO Avanzado**: Schema.org, sitemap.xml
- [ ] **Analytics**: Google Analytics 4, heatmaps
- [ ] **Testing**: A/B testing en CTAs

### Fase 4: Producción
- [ ] **Hosting**: Servidor con SSL
- [ ] **Email**: Sistema de notificaciones automáticas
- [ ] **WhatsApp**: Integración de chat
- [ ] **Blog**: CMS para contenido regular

---

## 🎓 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Variables, Grid, Flexbox, Animations
- **JavaScript ES6+**: Modules, Classes, Arrow Functions
- **Google Fonts**: Playfair Display + Montserrat

### Sin Dependencias Externas

- ❌ jQuery
- ❌ Bootstrap
- ❌ TailwindCSS
- ❌ React/Vue/Angular

**Beneficios**: Carga ultra-rápida, control total, mantenibilidad

---

## 📞 Contacto Técnico

Para modificaciones avanzadas o consultas sobre la implementación:

- El código está completamente comentado
- Cada módulo JS es independiente
- CSS usa BEM-like naming
- Variables centralizadas en `:root`

---

## 📝 Notas de Diseño

### Diferencias con la Version Anterior

| **Aspecto** | **Antes** | **Ahora** |
|-------------|----------|----------|
| **Paleta** | Navy + Gold/Cyan | **Navy + Orange + Cream** |
| **Tipografía** | Inter + Clash Display | **Playfair + Montserrat** |
| **Estilo** | Futurista, Tech | **Premium, Cálido** |
| **Fondos** | Dark predominante | **Crema iluminado** |
| **Animaciones** | Rápidas, llamativas | **Sutiles, elegantes** |
| **Estructura** | Landing page única | **Plataforma multipágina** |

### Filosofía de Color

**Navy**: Transmite confianza, estabilidad, profesionalismo
**Orange**: Agrega energía, calidez, acción (usado estratégicamente)
**Cream**: Ilumina, abre espacio, da respiración visual

---

## ✅ Checklist de Calidad

- [x] Paleta de colores premium implementada
- [x] Tipografía sofisticada (Serif + Sans)
- [x] Animaciones sutiles y profesionales
- [x] Hero slider cinemático
- [x] Buscador inteligente integrado
- [x] Grid de propiedades con hover elegante
- [x] 3 pilares de confianza
- [x] Testimonials carousel
- [x] Catálogo con filtros avanzados
- [x] Vista dual (Grid/Map)
- [x] Navegación con dropdowns
- [x] Footer completo
- [x] Responsive design
- [x] Accesibilidad (prefers-reduced-motion)

---

**Desarrollado para San Emilio Propiedades**  
*Más que propiedades, encontramos hogares en la Araucanía*

🏠 **Versión**: 2.0 Premium  
📅 **Última Actualización**: Febrero 2026
