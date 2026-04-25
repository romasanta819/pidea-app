# Solución de Acceso al Servidor

## Problema: No puedo acceder al host

### Soluciones paso a paso:

#### 1. Verificar que el servidor está corriendo

Abre una terminal y ejecuta:
```powershell
npm run dev
```

Deberías ver algo como:
```
VITE v5.4.21  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.X.X:3000/
```

#### 2. Si ves un error de puerto ocupado

El servidor automáticamente usará otro puerto (3001, 3002, etc.)
Abre la URL que aparece en la consola.

#### 3. Abrir manualmente en el navegador

1. Abre tu navegador (Chrome, Firefox, Edge)
2. Ve a la barra de direcciones
3. Escribe: `http://localhost:3000` (o el puerto que muestre la consola)
4. Presiona Enter

#### 4. Si usas 0.0.0.0 como host

También puedes probar:
- `http://127.0.0.1:3000`
- `http://localhost:3000`

#### 5. Verificar Firewall

Si aún no funciona:
- Verifica que Windows Firewall no esté bloqueando Node.js
- Permite Node.js en el firewall si aparece una solicitud

#### 6. Reiniciar servidor limpio

```powershell
# Cerrar todos los procesos Node
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Esperar 2 segundos
Start-Sleep -Seconds 2

# Iniciar servidor nuevamente
npm run dev
```

#### 7. Usar un puerto específico

Si quieres forzar el puerto 3000, edita `vite.config.ts`:
```typescript
server: {
  port: 3000,
  host: 'localhost', // Solo localhost
  strictPort: true   // Forzar este puerto
}
```

#### 8. Probar con puerto diferente

Si el 3000 tiene problemas, prueba otro:
```typescript
server: {
  port: 5173, // Puerto por defecto de Vite
  host: true
}
```

## Verificación rápida

1. ✅ ¿El servidor muestra una URL en la consola?
2. ✅ ¿Copiaste exactamente esa URL al navegador?
3. ✅ ¿El navegador muestra algún error específico?
4. ✅ ¿Hay algún mensaje en la consola del servidor cuando intentas acceder?

## Si nada funciona

Intenta abrir el archivo `dist/index.html` directamente después de hacer `npm run build`:
```powershell
npm run build
# Luego abre dist/index.html en el navegador
```

