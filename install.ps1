# YALA ERP - Instalador automatico (idempotente)
# Si una herramienta ya esta instalada, la omite y continua.

$ErrorActionPreference = 'Stop'

function Test-Command($name) {
    return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

Write-Host "=== YALA ERP - Instalador ===" -ForegroundColor Cyan

if (-not (Test-Command 'winget')) {
    Write-Host "winget no esta disponible. Instala 'App Installer' desde Microsoft Store y vuelve a ejecutar este script." -ForegroundColor Red
    exit 1
}

# --- Git ---
if (Test-Command 'git') {
    Write-Host "[OK] Git ya esta instalado" -ForegroundColor Green
} else {
    Write-Host "Instalando Git..." -ForegroundColor Yellow
    winget install --id Git.Git -e --silent --accept-package-agreements --accept-source-agreements
}

# --- Node.js ---
if (Test-Command 'node') {
    Write-Host "[OK] Node.js ya esta instalado ($(node --version))" -ForegroundColor Green
} else {
    Write-Host "Instalando Node.js LTS..." -ForegroundColor Yellow
    winget install --id OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
}

if (-not (Test-Command 'node')) {
    Write-Host "Node.js se instalo pero no esta en el PATH de esta sesion. Cierra y vuelve a abrir la terminal, luego re-ejecuta este script." -ForegroundColor Yellow
    exit 1
}

# --- PostgreSQL ---
$psqlCmd = $null
if (Test-Command 'psql') {
    $psqlCmd = 'psql'
} else {
    $candidato = Get-ChildItem "C:\Program Files\PostgreSQL" -Directory -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending | Select-Object -First 1
    if ($candidato) { $psqlCmd = Join-Path $candidato.FullName "bin\psql.exe" }
}

if ($psqlCmd) {
    Write-Host "[OK] PostgreSQL ya esta instalado" -ForegroundColor Green
} else {
    Write-Host "Instalando PostgreSQL..." -ForegroundColor Yellow
    winget install --id PostgreSQL.PostgreSQL.16 -e --silent --accept-package-agreements --accept-source-agreements
    $candidato = Get-ChildItem "C:\Program Files\PostgreSQL" -Directory -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending | Select-Object -First 1
    if ($candidato) {
        $psqlCmd = Join-Path $candidato.FullName "bin\psql.exe"
        Write-Host "IMPORTANTE: anota la contrasena de 'postgres' que configuraste durante la instalacion." -ForegroundColor Yellow
    } else {
        Write-Host "No se pudo confirmar la instalacion de PostgreSQL. Instalalo manualmente si el paso de BD falla." -ForegroundColor Red
    }
}

$root = $PSScriptRoot
$backendPath = Join-Path $root "backend"
$frontendPath = Join-Path $root "frontend"

# --- Dependencias backend ---
Push-Location $backendPath
if (Test-Path "node_modules") {
    Write-Host "[OK] Dependencias del backend ya instaladas" -ForegroundColor Green
} else {
    Write-Host "Instalando dependencias del backend..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
}
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Creado backend/.env — edita DB_PASSWORD y JWT_SECRET antes de produccion." -ForegroundColor Yellow
} else {
    Write-Host "[OK] backend/.env ya existe" -ForegroundColor Green
}
Pop-Location

# --- Dependencias frontend ---
Push-Location $frontendPath
if (Test-Path "node_modules") {
    Write-Host "[OK] Dependencias del frontend ya instaladas" -ForegroundColor Green
} else {
    Write-Host "Instalando dependencias del frontend..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
}
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Creado frontend/.env" -ForegroundColor Yellow
} else {
    Write-Host "[OK] frontend/.env ya existe" -ForegroundColor Green
}
Pop-Location

# --- Base de datos ---
if ($psqlCmd) {
    $envContent = Get-Content (Join-Path $backendPath ".env") | Where-Object { $_ -match '=' }
    $envMap = @{}
    foreach ($line in $envContent) {
        $parts = $line -split '=', 2
        $envMap[$parts[0].Trim()] = $parts[1].Trim()
    }
    $dbUser = $envMap['DB_USER']
    $dbPass = $envMap['DB_PASSWORD']
    $dbName = $envMap['DB_NAME']

    $env:PGPASSWORD = $dbPass
    $existe = & $psqlCmd -U $dbUser -h localhost -tAc "SELECT 1 FROM pg_database WHERE datname='$dbName'" 2>$null

    if ($existe -eq '1') {
        Write-Host "[OK] Base de datos '$dbName' ya existe" -ForegroundColor Green
    } else {
        Write-Host "Creando base de datos '$dbName'..." -ForegroundColor Yellow
        & $psqlCmd -U $dbUser -h localhost -c "CREATE DATABASE $dbName;"
        & $psqlCmd -U $dbUser -h localhost -d $dbName -f (Join-Path $root "database\schema.sql")
        Write-Host "[OK] Esquema cargado (19 tablas)" -ForegroundColor Green
    }
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
} else {
    Write-Host "No se pudo preparar PostgreSQL automaticamente. Crea la BD manualmente con database/schema.sql" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Instalacion completa ===" -ForegroundColor Cyan
Write-Host "Backend:  cd backend; npm run start:dev"
Write-Host "Frontend: cd frontend; npm run dev"
Write-Host "Login de prueba: crea una cuenta en /registro, o usa la que ya tengas en tu BD."
