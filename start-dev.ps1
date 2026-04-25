# Script para iniciar el servidor de desarrollo
Write-Host "Iniciando servidor Vite..." -ForegroundColor Green

# Matar procesos Node existentes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Esperar un momento
Start-Sleep -Seconds 1

# Iniciar servidor
npm run dev

