# Configuración de Carga Automática de Riesgo País

Este documento explica cómo configurar la carga automática de datos de riesgo país desde fuentes oficiales.

## 📋 Fuentes de Datos Disponibles

El sistema puede cargar datos de riesgo país desde:

1. **FRED API** (Federal Reserve Economic Data) - ⭐ Recomendado
   - Fuente oficial y confiable
   - Datos históricos completos
   - API gratuita (requiere registro)

2. **BCRA** (Banco Central de la República Argentina)
   - Datos oficiales locales
   - Implementación pendiente

3. **Datos locales** (CSV)
   - Fallback si no hay API disponible
   - Datos históricos hardcodeados

## 🔑 Configuración de FRED API

### Paso 1: Obtener API Key

1. Visita: https://fred.stlouisfed.org/docs/api/api_key.html
2. Regístrate para obtener una cuenta gratuita
3. Solicita tu API key (es gratuita y instantánea)

### Paso 2: Configurar API Key

#### Opción A: Variable de Entorno (Recomendado para Producción)

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_FRED_API_KEY=tu_api_key_aqui
```

**Importante:** Agrega `.env` a tu `.gitignore` para no subir tu API key al repositorio.

#### Opción B: Configuración Directa (Solo para Desarrollo)

Si prefieres configurarlo directamente en el código (no recomendado para producción):

1. Edita `src/services/riesgoPaisService.ts`
2. Modifica la función `getFredApiKey()`:

```typescript
const getFredApiKey = (): string | null => {
  // Para desarrollo: configura aquí temporalmente
  return 'tu_api_key_aqui';
  
  // O desde variables de entorno
  if (typeof process !== 'undefined' && process.env?.VITE_FRED_API_KEY) {
    return process.env.VITE_FRED_API_KEY;
  }
  
  return null;
};
```

## 📊 Uso del Sistema

### Uso Básico con Hook

```typescript
import { useRiesgoPais } from './hooks/useRiesgoPais';

function MiComponente() {
  const { datos, ultimoValor, cargando, error, actualizar } = useRiesgoPais(true);
  
  // datos: array con todos los puntos de riesgo país
  // ultimoValor: último valor disponible
  // cargando: estado de carga
  // error: mensaje de error si hay problema
  // actualizar: función para recargar datos
}
```

### Uso del Componente

```typescript
import RiesgoPaisLoader from './components/RiesgoPaisLoader';

function MiApp() {
  return (
    <div>
      <RiesgoPaisLoader 
        mostrarPanel={true}
        onDatosCargados={(datos) => {
          console.log('Datos cargados:', datos);
        }}
      />
    </div>
  );
}
```

### Actualizar Datos Históricos

```typescript
import { actualizarDatosHistoricosConRiesgoPaisReal } from './utils/actualizarDatosRiesgoPais';

// Cargar y actualizar datos históricos
const datosActualizados = await actualizarDatosHistoricosConRiesgoPaisReal();
// datosActualizados ahora tiene valores de riesgo país actualizados
```

## 🔄 Actualización Automática

El sistema puede actualizar los datos automáticamente:

```typescript
// Cargar al inicio
const { datos } = useRiesgoPais(true); // autoCargar = true

// O cargar manualmente
const { actualizar } = useRiesgoPais(false);
await actualizar();
```

## 📝 Formato de Datos

Los datos de riesgo país siguen esta estructura:

```typescript
interface RiesgoPaisDataPoint {
  fecha: string;      // Formato: YYYY-MM-DD
  anio: number;       // Año (1994-2024)
  mes: number;        // Mes (1-12)
  valor: number;      // Riesgo país en puntos básicos
  fuente: 'FRED' | 'BCRA' | 'MANUAL' | 'JPMORGAN';
}
```

## 🔧 Solución de Problemas

### No se cargan los datos desde FRED

1. **Verifica tu API key:**
   ```typescript
   // En la consola del navegador
   console.log(process.env.VITE_FRED_API_KEY);
   ```

2. **Revisa la consola:**
   - Busca errores de red
   - Verifica que la API key sea válida
   - Confirma que la serie de datos existe

3. **Usa el fallback:**
   - Si FRED falla, el sistema usa datos históricos locales automáticamente
   - Los datos locales incluyen valores desde 1994 hasta 2024

### Error: "No hay API key de FRED configurado"

- Configura `VITE_FRED_API_KEY` en tu archivo `.env`
- O modifica `getFredApiKey()` en `riesgoPaisService.ts`

### Datos no se actualizan

- Verifica que tienes conexión a internet
- Revisa que la API key sea válida y no haya expirado
- Consulta los logs en la consola para más detalles

## 📚 Referencias

- **FRED API Documentation:** https://fred.stlouisfed.org/docs/api/
- **EMBI Argentina:** J.P. Morgan Emerging Markets Bond Index
- **BCRA:** https://www.bcra.gob.ar/

## 🚀 Próximos Pasos

- [ ] Implementar carga desde BCRA API
- [ ] Agregar soporte para CSV local
- [ ] Implementar caché local de datos
- [ ] Agregar actualización automática periódica
- [ ] Mejorar manejo de errores y reintentos

## 💡 Notas

- Los datos de riesgo país se miden en **puntos básicos** (basis points)
- 100 puntos básicos = 1%
- El EMBI Argentina es calculado por J.P. Morgan
- Los valores históricos son aproximados y pueden variar según la fuente

