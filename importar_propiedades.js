/**
 * IMPORTAR PROPIEDADES — San Emilio Propiedades
 * =============================================
 * Lee propiedades.xlsx y genera propiedades.json listo para la web.
 *
 * Estructura de COLUMNAS del Excel (ver función crearExcelEjemplo):
 * ─────────────────────────────────────────────────────────────────
 *  ID              | Identificador único (número o texto)
 *  Titulo          | Nombre descriptivo de la propiedad
 *  Tipo_Operacion  | Venta | Arriendo
 *  Tipo_Propiedad  | Casa | Departamento | Parcela | Terreno | Comercial
 *  Estado          | Disponible | Reservado | Vendido
 *  Destacada       | SI | NO
 *
 *  — PRECIOS —
 *  Precio_UF       | Precio en UF (número)
 *  Precio_CLP      | Precio en pesos chilenos (número)
 *
 *  — CARACTERÍSTICAS —
 *  Dormitorios     | Número entero
 *  Banos           | Número entero
 *  Estacionamientos| Número entero
 *  Bodegas         | Número entero
 *  M2_Totales      | Superficie total del terreno en m²
 *  M2_Utiles       | Superficie útil (construida) en m²
 *  Antiguedad      | Años de antigüedad (número)
 *  Piso            | Número de piso (para departamentos)
 *  Pisos_Edificio  | Total de pisos del edificio
 *
 *  — UBICACIÓN —
 *  Region          | Nombre de la región
 *  Comuna          | Nombre de la comuna
 *  Direccion       | Dirección aproximada (no se muestra exacta por seguridad)
 *  Latitud         | Coordenada decimal ej: -38.7359
 *  Longitud        | Coordenada decimal ej: -72.5904
 *
 *  — DESCRIPCIÓN —
 *  Descripcion     | Texto largo de la ficha (puede contener saltos de línea)
 *  Extras          | Lista de características extra, separadas por coma
 *                  | Ej: "Piscina, Jardín, Bodega, Calefacción Central"
 *
 *  — IMÁGENES —
 *  URLs_Imagenes   | URLs de imágenes separadas por coma
 *                  | La primera URL será la imagen principal (portada)
 *
 *  — CONTACTO —
 *  Agente_Nombre   | Nombre del agente a cargo
 *  Agente_Tel      | Teléfono directo del agente
 *  Agente_Email    | Email del agente
 *
 * USO:
 *   node importar_propiedades.js
 *   (requiere: npm install xlsx)
 */

const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');

// ─── Configuración ─────────────────────────────────────────────────
const INPUT_FILE = path.resolve(__dirname, 'propiedades.xlsx');
const OUTPUT_FILE = path.resolve(__dirname, 'propiedades.json');

// ─── Mapeo de columnas Excel → campos JSON ──────────────────────────
// Clave: nombre exacto de la columna Excel (normalizado, sin acentos, lowercase, espacios→_)
// Valor: nombre del campo en el JSON final
const COLUMN_MAPPING = {
    // Básicos
    'id': 'id',
    'titulo': 'titulo',
    'tipo_operacion': 'operacion',
    'tipo_propiedad': 'tipo',
    'estado': 'estado',
    'destacada': 'destacada',

    // Precios
    'precio_uf': 'precioUF',
    'precio_clp': 'precioCLP',

    // Características físicas
    'dormitorios': 'dormitorios',
    'banos': 'banos',
    'baños': 'banos',          // variante con tilde
    'estacionamientos': 'estacionamientos',
    'bodegas': 'bodegas',
    'm2_totales': 'm2Totales',
    'm2_utiles': 'm2Utiles',
    'antiguedad': 'antiguedad',
    'piso': 'piso',
    'pisos_edificio': 'pisosEdificio',

    // Ubicación
    'region': 'region',
    'comuna': 'comuna',
    'direccion': 'direccion',
    'latitud': 'lat',
    'longitud': 'lng',

    // Descripción y extras
    'descripcion': 'descripcion',
    'extras': 'extras',         // → array de strings

    // Imágenes
    'urls_imagenes': 'imagenes',       // → array de URLs

    // Agente
    'agente_nombre': 'agenteNombre',
    'agente_tel': 'agenteTel',
    'agente_email': 'agenteEmail',
};

// ─── Campos numéricos ───────────────────────────────────────────────
const CAMPOS_NUMERICOS = new Set([
    'precioUF', 'precioCLP', 'dormitorios', 'banos', 'estacionamientos',
    'bodegas', 'm2Totales', 'm2Utiles', 'antiguedad', 'piso', 'pisosEdificio',
    'lat', 'lng',
]);

// ─── Helpers ────────────────────────────────────────────────────────
function normalizarClave(texto) {
    return String(texto || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')  // eliminar acentos
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
}

function splitCSV(value) {
    return String(value || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
}

// ─── Función principal ───────────────────────────────────────────────
function procesarExcel() {
    console.log(`\n🏠 San Emilio Propiedades — Importador v2.0\n${'─'.repeat(45)}`);
    console.log(`📂 Buscando archivo: ${INPUT_FILE}`);

    if (!fs.existsSync(INPUT_FILE)) {
        console.warn(`⚠️  Archivo no encontrado. Creando plantilla de ejemplo...`);
        crearExcelEjemplo();
        return;
    }

    try {
        const workbook = XLSX.readFile(INPUT_FILE);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { defval: null });

        if (rawData.length === 0) {
            console.error('❌ El Excel está vacío o no tiene filas de datos.');
            return;
        }

        console.log(`📊 Procesando ${rawData.length} filas desde la hoja "${sheetName}"...`);

        const propiedadesProcesadas = rawData.map((row, index) => {
            const prop = {};

            // Mapear cada columna del Excel al campo JSON correspondiente
            for (const [excelKey, rawValue] of Object.entries(row)) {
                const normalizedKey = normalizarClave(excelKey);
                const jsonKey = COLUMN_MAPPING[normalizedKey];
                if (!jsonKey) continue; // columna desconocida, ignorar

                let value = rawValue;

                // Transformaciones según el campo
                if (jsonKey === 'imagenes') {
                    value = splitCSV(value);
                } else if (jsonKey === 'extras') {
                    value = splitCSV(value);
                } else if (jsonKey === 'destacada') {
                    value = String(value || '').trim().toUpperCase() === 'SI';
                } else if (CAMPOS_NUMERICOS.has(jsonKey)) {
                    value = Number(value) || 0;
                } else if (value !== null) {
                    value = String(value).trim();
                }

                prop[jsonKey] = value;
            }

            // ─── Defaults y validaciones ────────────────────────────
            if (!prop.id) prop.id = index + 1;

            // Imagen principal = primera URL del array
            prop.imagenPrincipal = (prop.imagenes && prop.imagenes.length > 0)
                ? prop.imagenes[0]
                : null;

            // Normalizar tipo y operación a lowercase para los filtros
            if (prop.tipo) prop.tipo = prop.tipo.toLowerCase().replace('departamento', 'departamento');
            if (prop.operacion) prop.operacion = prop.operacion.toLowerCase();

            // Asegurar que extras sea siempre array
            if (!Array.isArray(prop.extras)) prop.extras = [];

            return prop;
        });

        // Guardar JSON con indentación legible
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(propiedadesProcesadas, null, 2), 'utf-8');

        console.log(`\n✅ Exportación exitosa:`);
        console.log(`   • ${propiedadesProcesadas.length} propiedades guardadas en "${OUTPUT_FILE}"`);
        const tipos = [...new Set(propiedadesProcesadas.map(p => p.tipo).filter(Boolean))];
        console.log(`   • Tipos: ${tipos.join(', ') || '(sin tipo definido)'}`);
        const comunas = [...new Set(propiedadesProcesadas.map(p => p.comuna).filter(Boolean))];
        console.log(`   • Comunas: ${comunas.join(', ') || '(sin comuna definida)'}`);
        console.log(`\n🚀 La web puede leer los datos actualizados.\n`);

    } catch (error) {
        console.error('❌ Error procesando el Excel:', error.message);
        console.error(error.stack);
    }
}

// ─── Crear archivo Excel de ejemplo / plantilla ─────────────────────
function crearExcelEjemplo() {
    const data = [
        {
            "ID": 1,
            "Titulo": "Casa Moderna Vista al Volcán",
            "Tipo_Operacion": "Venta",
            "Tipo_Propiedad": "Casa",
            "Estado": "Disponible",
            "Destacada": "SI",
            "Precio_UF": 10500,
            "Precio_CLP": 385000000,
            "Dormitorios": 4,
            "Banos": 3,
            "Estacionamientos": 2,
            "Bodegas": 1,
            "M2_Totales": 5000,
            "M2_Utiles": 280,
            "Antiguedad": 5,
            "Piso": null,
            "Pisos_Edificio": null,
            "Region": "La Araucanía",
            "Comuna": "Temuco",
            "Direccion": "Sector Temuco Alto",
            "Latitud": -38.7359,
            "Longitud": -72.5904,
            "Descripcion": "Espectacular casa con vista privilegiada al Volcán Villarrica. Diseñada por arquitecto local, combina materialidad sureña con estética moderna. Amplio living-comedor con chimenea, cocina equipada con isla, dormitorio principal en suite con walk-in closet.",
            "Extras": "Piscina, Quincho, Jardín, Bodega, Calefacción Central, Alarma",
            "URLs_Imagenes": "https://images.unsplash.com/photo-1600596542815-6000255adeba, https://images.unsplash.com/photo-1600607687939-ce8a6c25118c, https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
            "Agente_Nombre": "Camila Muñoz",
            "Agente_Tel": "+56951492209",
            "Agente_Email": "camila@sanemilio.cl"
        },
        {
            "ID": 2,
            "Titulo": "Departamento Centro Temuco",
            "Tipo_Operacion": "Venta",
            "Tipo_Propiedad": "Departamento",
            "Estado": "Disponible",
            "Destacada": "NO",
            "Precio_UF": 4500,
            "Precio_CLP": 165000000,
            "Dormitorios": 3,
            "Banos": 2,
            "Estacionamientos": 1,
            "Bodegas": 1,
            "M2_Totales": 120,
            "M2_Utiles": 110,
            "Antiguedad": 2,
            "Piso": 8,
            "Pisos_Edificio": 15,
            "Region": "La Araucanía",
            "Comuna": "Temuco",
            "Direccion": "Centro, Temuco",
            "Latitud": -38.7400,
            "Longitud": -72.5950,
            "Descripcion": "Luminoso departamento en piso alto con vista panorámica al centro de Temuco. Full equipado, cocina americana, dormitorios con clóset empotrado. Edificio con conserjería 24h, gimnasio y terraza común.",
            "Extras": "Conserjería 24h, Gimnasio, Terraza Común, Acceso Discapacitados",
            "URLs_Imagenes": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00, https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
            "Agente_Nombre": "Camila Muñoz",
            "Agente_Tel": "+56951492209",
            "Agente_Email": "camila@sanemilio.cl"
        },
        {
            "ID": 3,
            "Titulo": "Parcela Virgen en Cunco",
            "Tipo_Operacion": "Venta",
            "Tipo_Propiedad": "Parcela",
            "Estado": "Disponible",
            "Destacada": "NO",
            "Precio_UF": 2800,
            "Precio_CLP": 102760000,
            "Dormitorios": null,
            "Banos": null,
            "Estacionamientos": null,
            "Bodegas": null,
            "M2_Totales": 50000,
            "M2_Utiles": null,
            "Antiguedad": null,
            "Piso": null,
            "Pisos_Edificio": null,
            "Region": "La Araucanía",
            "Comuna": "Cunco",
            "Direccion": "Sector Lago Colico, Cunco",
            "Latitud": -38.9393,
            "Longitud": -72.0260,
            "Descripcion": "5 hectáreas con deslindes regulares, título saneado, acceso por camino mejorado. Vegetación nativa, quebrada con agua. Ideal proyecto turístico o residencia campestre.",
            "Extras": "Escritura Clara, Título Saneado, Acceso Todo el Año, Agua Vertiente",
            "URLs_Imagenes": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
            "Agente_Nombre": "Camila Muñoz",
            "Agente_Tel": "+56951492209",
            "Agente_Email": "camila@sanemilio.cl"
        }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar ancho de columnas automáticamente
    const colWidths = Object.keys(data[0]).map(key => ({
        wch: Math.max(key.length, 20)
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Propiedades');
    XLSX.writeFile(wb, INPUT_FILE);

    console.log(`✅ Plantilla creada: "${INPUT_FILE}"`);
    console.log(`   Contiene ${data.length} propiedades de ejemplo con TODAS las columnas disponibles.`);
    console.log(`   Edítala y ejecuta: node importar_propiedades.js\n`);
}

// ─── Ejecutar ────────────────────────────────────────────────────────
procesarExcel();
