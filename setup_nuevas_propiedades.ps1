$base = "C:\Users\figue\OneDrive\Escritorio\SAN EMILIO\propiedades-imgs"

# ======================================================
# 1. CASA VILLA SANTA LUISA
# ======================================================
$dst1 = "$base\casa-villa-santa-luisa"
New-Item -ItemType Directory -Force -Path $dst1 | Out-Null

$src1 = "$base\ARRIENDA CASA - VILLA SANTA LUISA TEMUCO"
$santaFiles = Get-ChildItem $src1 -Filter "*.jpg" | Sort-Object Length -Descending

$i = 1
foreach ($f in $santaFiles) {
    Copy-Item $f.FullName "$dst1\$i.jpg" -Force
    $i++
}
# Portada = primera foto (la de mayor tamano = exterior)
$portada1 = $santaFiles | Sort-Object Length -Descending | Select-Object -First 1
Copy-Item $portada1.FullName "$dst1\PORTADA.jpg" -Force
Write-Host "Casa Villa Santa Luisa: $($i-1) fotos copiadas"

# ======================================================
# 2. DEPARTAMENTO THIERS 11
# ======================================================
$dst2 = "$base\depa-thiers-11"
New-Item -ItemType Directory -Force -Path $dst2 | Out-Null

$src2 = "$base\ARRIENDA thiers 11"
$thiersFiles = Get-ChildItem $src2 -Filter "*.jpg" | Sort-Object Name

$i = 1
# La primera imagen (flyer con logo) va como portada
$thiersSorted = $thiersFiles | Sort-Object Length
$thiersPortada = $thiersSorted | Select-Object -First 1  # el mas pequeno es el flyer

foreach ($f in ($thiersFiles | Sort-Object Name)) {
    Copy-Item $f.FullName "$dst2\$i.jpg" -Force
    $i++
}
Copy-Item $thiersPortada.FullName "$dst2\PORTADA.jpg" -Force
Write-Host "Depa Thiers 11: $($i-1) fotos copiadas"

# ======================================================
# 3. DEPARTAMENTO CONDOMINIO LOMAS DE JAVIERA
# ======================================================
$dst3 = "$base\depa-lomas-javiera"
New-Item -ItemType Directory -Force -Path $dst3 | Out-Null

$src3 = "$base\arrienda departamento remodelado - Condominio Lomas de Javiera, Temuco"
$lomasFiles = Get-ChildItem $src3 -Filter "*.jpg" | Sort-Object Name

$i = 1
$lomasSorted = $lomasFiles | Sort-Object Length
$lomasPortada = $lomasSorted | Select-Object -First 1  # el mas pequeno = flyer

foreach ($f in $lomasFiles) {
    Copy-Item $f.FullName "$dst3\$i.jpg" -Force
    $i++
}
Copy-Item $lomasPortada.FullName "$dst3\PORTADA.jpg" -Force
Write-Host "Depa Lomas de Javiera: $($i-1) fotos copiadas"

# ======================================================
# 4. EDIFICIO ALPES (VENTA)
# ======================================================
$dst4 = "$base\edificio-alpes"
New-Item -ItemType Directory -Force -Path $dst4 | Out-Null

$src4 = "$base\venta - Edificio Alpes"
$alpesFiles = Get-ChildItem $src4 -Filter "*.jpg" | Sort-Object Name

$i = 1
$alpesSorted = $alpesFiles | Sort-Object Length
$alpesPortada = $alpesSorted | Select-Object -First 1  # el mas pequeno = flyer

foreach ($f in $alpesFiles) {
    Copy-Item $f.FullName "$dst4\$i.jpg" -Force
    $i++
}
Copy-Item $alpesPortada.FullName "$dst4\PORTADA.jpg" -Force
Write-Host "Edificio Alpes: $($i-1) fotos copiadas"

Write-Host ""
Write-Host "LISTO! Todas las carpetas creadas exitosamente."
