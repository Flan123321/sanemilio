const fs = require('fs');
const path = require('path');

const base = 'C:\\Users\\figue\\OneDrive\\Escritorio\\SAN EMILIO\\propiedades-imgs';

// Leer el directorio con nombres exactos y listar archivos de cada carpeta nueva
const newDirs = [
  'ARRIENDA CASA EN LABRANZA roja',
  'SE ARRIENDA Departamento valle javiera',
  'VENDE CASA EN GORBEA',
  'molco puc\u00f3n',
  'parcela molco alto',
  'tres parcelas colicheo',
  'vende hermosa y amplia casa en Fundo El Carmen  azul',
  'rahuealtoosorno',
];

// También busca la carpeta de Los Tilos
const allDirs = fs.readdirSync(base);
console.log('\n=== TODAS LAS CARPETAS ===');
allDirs.forEach(d => console.log(JSON.stringify(d)));

console.log('\n=== ARCHIVOS EN CADA CARPETA NUEVA ===');
allDirs.forEach(d => {
  const fullPath = path.join(base, d);
  try {
    const files = fs.readdirSync(fullPath).filter(f => f.toLowerCase().endsWith('.jpg'));
    if (files.length > 0 && !['casa-labranza','casa-labranza-2','casa-lautaro','casa-villa-santa-luisa','depa-av-alemania','depa-lomas-javiera','depa-senador','depa-thiers-11','edificio-alpes','edificio-don-simon','parcela-huichahue','ARRIENDA CASA - VILLA SANTA LUISA TEMUCO','ARRIENDA thiers 11','arrienda departamento remodelado - Condominio Lomas de Javiera, Temuco','venta - Edificio Alpes'].some(x => d.includes(x.split(' ')[0]))) {
      console.log(`\n[${d}] -> ${files.length} fotos`);
      // Mostrar la imagen mas grande (probablemente el flyer)
      const sorted = files.map(f => ({ f, size: fs.statSync(path.join(fullPath, f)).size })).sort((a,b) => b.size - a.size);
      sorted.slice(0,3).forEach(x => console.log(`  ${x.size}b: ${x.f}`));
    }
  } catch(e) {}
});
