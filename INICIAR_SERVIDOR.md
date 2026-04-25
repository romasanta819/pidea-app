# Cómo iniciar el servidor

## Pasos para acceder a la aplicación

### 1. Abrir terminal
- Abre PowerShell o CMD en la carpeta del proyecto
- O usa la terminal integrada de tu editor

### 2. Ejecutar el servidor
```powershell
npm run dev
```

### 3. Esperar el mensaje
Deberías ver algo como:
```
VITE v5.4.21  ready in XXX ms

➜  Local:   http://localhost:3000/
```

### 4. Abrir en el navegador
- Copia la URL que aparece (ej: `http://localhost:3000`)
- Pégalo en tu navegador (Chrome, Firefox, Edge)
- O haz clic si se abre automáticamente

## Solución de problemas

### Si el puerto 3000 está ocupado
El servidor automáticamente usará otro puerto (3001, 3002, etc.)
Revisa la URL que muestra en la consola.

### Si no puedes acceder
1. Verifica que la terminal muestre "ready"
2. Copia exactamente la URL que aparece
3. Prueba también: `http://127.0.0.1:3000`
4. Si usas firewall, permite Node.js

### Si el servidor no inicia
1. Verifica que Node.js esté instalado: `node --version`
2. Instala dependencias: `npm install`
3. Revisa errores en la consola

## Comando rápido
```powershell
# Cerrar procesos anteriores (si hay)
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Iniciar servidor
npm run dev
```

