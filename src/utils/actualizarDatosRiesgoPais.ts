// Utilidad para actualizar los datos históricos con datos reales de riesgo país
// Esta función puede ser llamada manualmente o automáticamente para sincronizar los datos

import { HISTORICAL_DATA, HistoricalDataPoint } from '../data/historicalData';
import { cargarRiesgoPaisCompleto, actualizarRiesgoPaisEnHistorico } from '../services/riesgoPaisService';

/**
 * Actualiza los datos históricos con valores reales de riesgo país cargados
 * Retorna una copia actualizada de HISTORICAL_DATA con valores de riesgo país actualizados
 */
export async function actualizarDatosHistoricosConRiesgoPaisReal(): Promise<HistoricalDataPoint[]> {
  console.log('🔄 Actualizando datos históricos con riesgo país real...');
  
  // Cargar datos de riesgo país
  const datosRiesgoPais = await cargarRiesgoPaisCompleto();
  
  if (datosRiesgoPais.length === 0) {
    console.warn('⚠️ No se pudieron cargar datos de riesgo país. Manteniendo valores originales.');
    return [...HISTORICAL_DATA];
  }
  
  // Crear mapa año -> valor promedio
  const mapaAnual = actualizarRiesgoPaisEnHistorico(datosRiesgoPais);
  
  // Actualizar cada punto histórico
  const datosActualizados = HISTORICAL_DATA.map(punto => {
    const nuevoValor = mapaAnual.get(punto.anio);
    
    if (nuevoValor !== undefined) {
      return {
        ...punto,
        riesgo_pais: nuevoValor,
      };
    }
    
    // Si no hay dato para ese año, mantener el valor original
    return punto;
  });
  
  console.log(`✅ Actualizados ${datosActualizados.length} puntos históricos con datos de riesgo país`);
  
  return datosActualizados;
}

/**
 * Función helper para obtener el valor de riesgo país para un año específico
 */
export function obtenerRiesgoPaisPorAnio(
  anio: number,
  datosRiesgoPais?: Map<number, number>
): number | null {
  if (!datosRiesgoPais) {
    // Buscar en datos históricos originales
    const punto = HISTORICAL_DATA.find(d => d.anio === anio);
    return punto?.riesgo_pais ?? null;
  }
  
  return datosRiesgoPais.get(anio) ?? null;
}

