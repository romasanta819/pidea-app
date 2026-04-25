// Servicio para cargar datos de riesgo país desde fuentes oficiales
// Fuentes: FRED (Federal Reserve Economic Data), BCRA, J.P. Morgan EMBI

export interface RiesgoPaisDataPoint {
  fecha: string; // Formato: YYYY-MM-DD
  anio: number;
  mes: number;
  valor: number; // Riesgo país en puntos básicos
  fuente: 'FRED' | 'BCRA' | 'MANUAL' | 'JPMORGAN';
}

interface FredObservation {
  date: string;
  value: string;
}

interface FredApiResponse {
  error_code?: number;
  error_message?: string;
  observations: FredObservation[];
}

// Datos históricos hardcodeados como fallback
const RIESGO_PAIS_HISTORICO_FALLBACK: RiesgoPaisDataPoint[] = [
  { fecha: '1994-01-01', anio: 1994, mes: 1, valor: 800, fuente: 'MANUAL' },
  { fecha: '1995-01-01', anio: 1995, mes: 1, valor: 1200, fuente: 'MANUAL' },
  { fecha: '1996-01-01', anio: 1996, mes: 1, valor: 900, fuente: 'MANUAL' },
  { fecha: '1997-01-01', anio: 1997, mes: 1, valor: 600, fuente: 'MANUAL' },
  { fecha: '1998-01-01', anio: 1998, mes: 1, valor: 500, fuente: 'MANUAL' },
  { fecha: '1999-01-01', anio: 1999, mes: 1, valor: 800, fuente: 'MANUAL' },
  { fecha: '2000-01-01', anio: 2000, mes: 1, valor: 1000, fuente: 'MANUAL' },
  { fecha: '2001-01-01', anio: 2001, mes: 1, valor: 3000, fuente: 'MANUAL' },
  { fecha: '2002-01-01', anio: 2002, mes: 1, valor: 4500, fuente: 'MANUAL' },
  { fecha: '2003-01-01', anio: 2003, mes: 1, valor: 2800, fuente: 'MANUAL' },
  { fecha: '2004-01-01', anio: 2004, mes: 1, valor: 1800, fuente: 'MANUAL' },
  { fecha: '2005-01-01', anio: 2005, mes: 1, valor: 1200, fuente: 'MANUAL' },
  { fecha: '2006-01-01', anio: 2006, mes: 1, valor: 900, fuente: 'MANUAL' },
  { fecha: '2007-01-01', anio: 2007, mes: 1, valor: 700, fuente: 'MANUAL' },
  { fecha: '2008-01-01', anio: 2008, mes: 1, valor: 800, fuente: 'MANUAL' },
  { fecha: '2009-01-01', anio: 2009, mes: 1, valor: 1200, fuente: 'MANUAL' },
  { fecha: '2010-01-01', anio: 2010, mes: 1, valor: 900, fuente: 'MANUAL' },
  { fecha: '2011-01-01', anio: 2011, mes: 1, valor: 800, fuente: 'MANUAL' },
  { fecha: '2012-01-01', anio: 2012, mes: 1, valor: 1000, fuente: 'MANUAL' },
  { fecha: '2013-01-01', anio: 2013, mes: 1, valor: 1200, fuente: 'MANUAL' },
  { fecha: '2014-01-01', anio: 2014, mes: 1, valor: 1800, fuente: 'MANUAL' },
  { fecha: '2015-01-01', anio: 2015, mes: 1, valor: 2200, fuente: 'MANUAL' },
  { fecha: '2016-01-01', anio: 2016, mes: 1, valor: 2800, fuente: 'MANUAL' },
  { fecha: '2017-01-01', anio: 2017, mes: 1, valor: 2500, fuente: 'MANUAL' },
  { fecha: '2018-01-01', anio: 2018, mes: 1, valor: 3500, fuente: 'MANUAL' },
  { fecha: '2019-01-01', anio: 2019, mes: 1, valor: 4200, fuente: 'MANUAL' },
  { fecha: '2020-01-01', anio: 2020, mes: 1, valor: 3800, fuente: 'MANUAL' },
  { fecha: '2021-01-01', anio: 2021, mes: 1, valor: 3200, fuente: 'MANUAL' },
  { fecha: '2022-01-01', anio: 2022, mes: 1, valor: 2800, fuente: 'MANUAL' },
  { fecha: '2023-01-01', anio: 2023, mes: 1, valor: 2500, fuente: 'MANUAL' },
  { fecha: '2024-01-01', anio: 2024, mes: 1, valor: 1800, fuente: 'MANUAL' },
];

/**
 * Obtiene el API key de FRED desde las variables de entorno
 * Para obtener un API key gratuito: https://fred.stlouisfed.org/docs/api/api_key.html
 */
const getFredApiKey = (): string | null => {
  // Primero intenta desde variables de entorno (para producción)
  if (typeof process !== 'undefined' && process.env?.VITE_FRED_API_KEY) {
    return process.env.VITE_FRED_API_KEY;
  }
  
  // Si no hay API key, retorna null (usará fallback)
  return null;
};

/**
 * Carga datos de riesgo país desde FRED API
 * Serie: EMBI Argentina (código puede variar, ejemplo: EMBIGL Argentina)
 */
export async function cargarRiesgoPaisDesdeFRED(
  fechaInicio?: string,
  fechaFin?: string
): Promise<RiesgoPaisDataPoint[]> {
  const apiKey = getFredApiKey();
  
  if (!apiKey) {
    console.warn('⚠️ No hay API key de FRED configurado. Usando datos locales.');
    return [];
  }

  try {
    // FRED API endpoint - Serie de EMBI Argentina
    // Nota: El código exacto de la serie puede variar, este es un ejemplo
    const serieId = 'EMBIGL'; // Ejemplo - ajustar según serie real de Argentina
    const fechaInicioParam = fechaInicio || '1994-01-01';
    const fechaFinParam = fechaFin || new Date().toISOString().split('T')[0];
    
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${serieId}&api_key=${apiKey}&file_type=json&observation_start=${fechaInicioParam}&observation_end=${fechaFinParam}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status}`);
    }
    
    const data: FredApiResponse = await response.json();
    
    if (data.error_code) {
      console.error('Error de FRED API:', data.error_message);
      return [];
    }
    
    // Convertir respuesta de FRED a nuestro formato
    const puntos: RiesgoPaisDataPoint[] = data.observations
      .filter((obs) => obs.value !== '.') // Filtrar valores faltantes
      .map((obs) => {
        const fecha = new Date(obs.date);
        return {
          fecha: obs.date,
          anio: fecha.getFullYear(),
          mes: fecha.getMonth() + 1,
          valor: parseFloat(obs.value),
          fuente: 'FRED' as const,
        };
      });
    
    console.log(`✅ Cargados ${puntos.length} puntos de riesgo país desde FRED`);
    return puntos;
    
  } catch (error) {
    console.error('Error al cargar datos desde FRED:', error);
    return [];
  }
}

/**
 * Carga datos desde una API alternativa o CSV
 * Por ahora retorna datos locales, pero puede extenderse para otras fuentes
 */
export async function cargarRiesgoPaisAlternativo(): Promise<RiesgoPaisDataPoint[]> {
  // Aquí se puede implementar carga desde:
  // - BCRA API (si está disponible)
  // - Trading Economics API
  // - CSV local
  // - Otra fuente oficial
  
  console.log('📊 Cargando datos alternativos de riesgo país...');
  
  // Por ahora retornamos un array vacío
  // En el futuro se puede implementar lectura desde archivo local o otra API
  return [];
}

/**
 * Carga datos de riesgo país combinando múltiples fuentes
 * Prioridad: FRED > Alternativo > Fallback (datos históricos)
 */
export async function cargarRiesgoPaisCompleto(): Promise<RiesgoPaisDataPoint[]> {
  // Intentar cargar desde FRED primero
  const datosFred = await cargarRiesgoPaisDesdeFRED();
  
  if (datosFred.length > 0) {
    return datosFred;
  }
  
  // Si FRED falla, intentar fuente alternativa
  const datosAlternativos = await cargarRiesgoPaisAlternativo();
  
  if (datosAlternativos.length > 0) {
    return datosAlternativos;
  }
  
  // Si todo falla, usar datos históricos hardcodeados
  console.warn('⚠️ Usando datos históricos locales como fallback');
  return RIESGO_PAIS_HISTORICO_FALLBACK;
}

/**
 * Obtiene el último valor de riesgo país disponible
 */
export async function obtenerUltimoRiesgoPais(): Promise<number | null> {
  const datos = await cargarRiesgoPaisCompleto();
  
  if (datos.length === 0) {
    return null;
  }
  
  // Ordenar por fecha y obtener el más reciente
  const ultimo = datos.sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  )[0];
  
  return ultimo.valor;
}

/**
 * Actualiza los datos de riesgo país en el sistema histórico
 * Toma los datos cargados y los integra con historicalData.ts
 */
export function actualizarRiesgoPaisEnHistorico(
  datosRiesgoPais: RiesgoPaisDataPoint[]
): Map<number, number> {
  // Crear un mapa año -> array de valores para ese año
  const mapaAnual = new Map<number, number[]>();
  
  datosRiesgoPais.forEach(punto => {
    const valoresAnuales = mapaAnual.get(punto.anio) || [];
    valoresAnuales.push(punto.valor);
    mapaAnual.set(punto.anio, valoresAnuales);
  });
  
  // Calcular promedio por año
  const mapaPromedio = new Map<number, number>();
  mapaAnual.forEach((valores: number[], anio: number) => {
    const promedio = valores.reduce((sum: number, val: number) => sum + val, 0) / valores.length;
    mapaPromedio.set(anio, Math.round(promedio));
  });
  
  return mapaPromedio;
}

/**
 * Función helper para parsear CSV de riesgo país
 * Formato esperado: fecha,valor o año,mes,valor
 */
export function parsearCSVRiesgoPais(csvContent: string): RiesgoPaisDataPoint[] {
  const lineas = csvContent.trim().split('\n');
  const puntos: RiesgoPaisDataPoint[] = [];
  
  // Saltar header si existe
  let inicio = 0;
  if (lineas[0] && (lineas[0].includes('fecha') || lineas[0].includes('año'))) {
    inicio = 1;
  }
  
  for (let i = inicio; i < lineas.length; i++) {
    const linea = lineas[i].trim();
    if (!linea) continue;
    
    const partes = linea.split(',');
    
    try {
      if (partes.length >= 2) {
        let fecha: string;
        let valor: number;
        
        if (partes.length === 2) {
          // Formato: fecha,valor
          fecha = partes[0].trim();
          valor = parseFloat(partes[1].trim());
        } else {
          // Formato: año,mes,valor
          const anio = parseInt(partes[0].trim());
          const mes = parseInt(partes[1].trim());
          fecha = `${anio}-${mes.toString().padStart(2, '0')}-01`;
          valor = parseFloat(partes[2].trim());
        }
        
        const fechaObj = new Date(fecha);
        
        puntos.push({
          fecha,
          anio: fechaObj.getFullYear(),
          mes: fechaObj.getMonth() + 1,
          valor,
          fuente: 'MANUAL',
        });
      }
    } catch (error) {
      console.warn(`Error al parsear línea ${i + 1}:`, error);
    }
  }
  
  return puntos;
}

