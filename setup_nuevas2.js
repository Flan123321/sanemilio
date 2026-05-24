const fs = require('fs');
const path = require('path');

const base = 'C:\\Users\\figue\\OneDrive\\Escritorio\\SAN EMILIO\\propiedades-imgs';

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function organizeFolder(srcName, dstName, portadaFile) {
  const srcDir = path.join(base, srcName);
  const dstDir = path.join(base, dstName);
  ensureDir(dstDir);

  const files = fs.readdirSync(srcDir)
    .filter(f => f.toLowerCase().endsWith('.jpg'))
    .sort();

  files.forEach((f, idx) => {
    fs.copyFileSync(path.join(srcDir, f), path.join(dstDir, `${idx + 1}.jpg`));
  });

  // Portada: usar el archivo especificado, o el más grande si no existe
  let portadaSrc = portadaFile ? path.join(srcDir, portadaFile) : null;
  if (!portadaSrc || !fs.existsSync(portadaSrc)) {
    // Usar la más grande como portada
    const sorted = files
      .map(f => ({ f, size: fs.statSync(path.join(srcDir, f)).size }))
      .sort((a, b) => b.size - a.size);
    portadaSrc = path.join(srcDir, sorted[0].f);
  }
  fs.copyFileSync(portadaSrc, path.join(dstDir, 'PORTADA.jpg'));
  console.log(`✓ ${dstName}: ${files.length} fotos`);
  return files.length;
}

// 1. Valle Javiera (Depto en condominio)
organizeFolder(
  'SE ARRIENDA Departamento valle javiera',
  'depa-valle-javiera',
  '694321508_17900856696429157_2587249204011300211_n.jpg' // foto más grande (374kb)
);

// 2. Casa Labranza Roja
organizeFolder(
  'ARRIENDA CASA EN LABRANZA roja',
  'casa-labranza-roja',
  '687302686_17900563119429157_5247683370863449537_n.jpg' // flyer San Emilio (292kb)
);

// 3. Casa Gorbea
organizeFolder(
  'VENDE CASA EN GORBEA',
  'casa-gorbea',
  '671178566_17898425031429157_4914547128677880188_n.jpg' // flyer San Emilio (310kb)
);

// 4. Molco Pucón (casa/cabaña)
organizeFolder(
  'molco puc\u00f3n',
  'casa-molco-pucon',
  '670843546_17897408481429157_403416432326608590_n.jpg' // foto exterior más grande (356kb)
);

// 5. Parcela Los Tilos Los Angeles
organizeFolder(
  'PARCELA LOS TILOS LOS ANGELES',
  'parcela-los-tilos',
  '672360543_18342411262243749_6731450080387853458_n.jpg' // foto más grande (334kb)
);

// 6. Tres Parcelas Colicheo
organizeFolder(
  'tres parcelas colicheo',
  'parcela-colicheo',
  '671129793_18342567928243749_6541778815259921772_n.jpg' // foto más grande (520kb)
);

// 7. Fundo El Carmen Azul
organizeFolder(
  'vende hermosa y amplia casa en Fundo El Carmen  azul',
  'casa-fundo-el-carmen',
  '659556355_17894806137429157_7262175579081408721_n.jpg' // flyer San Emilio (204kb)
);

// 8. Parcela Molco Alto
organizeFolder(
  'parcela molco alto',
  'parcela-molco-alto',
  '656087038_17894269812429157_5505041519300495215_n.jpg' // foto más grande (268kb)
);

// 9. Rahue Alto Osorno (casa)
organizeFolder(
  'rahuealtoosorno',
  'casa-rahue-alto-osorno',
  '671758942_17897261070429157_5240410607776078389_n.jpg' // flyer San Emilio (230kb)
);

console.log('\n✅ Todas las carpetas organizadas!');
