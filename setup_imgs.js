const fs = require('fs');
const path = require('path');

const base = 'C:\\Users\\figue\\OneDrive\\Escritorio\\SAN EMILIO\\propiedades-imgs';

// Nombres exactos de carpetas fuente (con guion em U+2013)
const src1 = path.join(base, 'ARRIENDA CASA \u2013 VILLA SANTA LUISA TEMUCO');
const src2 = path.join(base, 'ARRIENDA thiers 11');
const src3 = path.join(base, 'arrienda departamento remodelado \u2013 Condominio Lomas de Javiera, Temuco');
const src4 = path.join(base, 'venta \u2013 Edificio Alpes');

// Nombres de carpetas destino
const dst1 = path.join(base, 'casa-villa-santa-luisa');
const dst2 = path.join(base, 'depa-thiers-11');
const dst3 = path.join(base, 'depa-lomas-javiera');
const dst4 = path.join(base, 'edificio-alpes');

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function copyImages(srcDir, dstDir, portadaFileName) {
  ensureDir(dstDir);
  const files = fs.readdirSync(srcDir).filter(f => f.toLowerCase().endsWith('.jpg')).sort();
  
  files.forEach((f, idx) => {
    const srcPath = path.join(srcDir, f);
    const dstPath = path.join(dstDir, `${idx + 1}.jpg`);
    fs.copyFileSync(srcPath, dstPath);
    console.log(`  Copied: ${f} -> ${idx + 1}.jpg`);
  });

  // Copiar portada
  const portadaSrc = path.join(srcDir, portadaFileName);
  if (fs.existsSync(portadaSrc)) {
    fs.copyFileSync(portadaSrc, path.join(dstDir, 'PORTADA.jpg'));
    console.log(`  Portada: ${portadaFileName}`);
  } else {
    // Si no existe, usar la primera foto como portada
    if (files.length > 0) {
      fs.copyFileSync(path.join(srcDir, files[0]), path.join(dstDir, 'PORTADA.jpg'));
      console.log(`  Portada (auto): ${files[0]}`);
    }
  }
  
  return files.length;
}

// =====================================================
// 1. Casa Villa Santa Luisa (portada = foto exterior)
// =====================================================
console.log('\n1. Casa Villa Santa Luisa...');
const n1 = copyImages(src1, dst1, '696104914_17901701283429157_882674369989507446_n.jpg');
console.log(`   -> ${n1} fotos copiadas`);

// =====================================================
// 2. Depa Thiers 11 (portada = flyer con logo San Emilio)
// =====================================================
console.log('\n2. Departamento Thiers 11...');
const n2 = copyImages(src2, dst2, '703658237_17902724688429157_304104458435552791_n.jpg');
console.log(`   -> ${n2} fotos copiadas`);

// =====================================================
// 3. Depa Lomas de Javiera (portada = flyer con logo San Emilio)
// =====================================================
console.log('\n3. Departamento Lomas de Javiera...');
const n3 = copyImages(src3, dst3, '689498092_17900855547429157_7129467523774690738_n.jpg');
console.log(`   -> ${n3} fotos copiadas`);

// =====================================================
// 4. Edificio Alpes (portada = flyer con logo San Emilio)
// =====================================================
console.log('\n4. Edificio Alpes...');
const n4 = copyImages(src4, dst4, '688265306_17901012756429157_8200845352811199614_n.jpg');
console.log(`   -> ${n4} fotos copiadas`);

console.log('\n✅ Todo listo!');
console.log(`   Fotos totales: ${n1 + n2 + n3 + n4}`);

// =====================================================
// Mostrar cantidad de fotos por propiedad (para el JSON)
// =====================================================
console.log('\nResumen para propiedades.json:');
console.log(`  casa-villa-santa-luisa: 1 a ${n1}.jpg`);
console.log(`  depa-thiers-11: 1 a ${n2}.jpg`);
console.log(`  depa-lomas-javiera: 1 a ${n3}.jpg`);
console.log(`  edificio-alpes: 1 a ${n4}.jpg`);
