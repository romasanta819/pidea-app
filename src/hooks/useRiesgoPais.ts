import { useState, useEffect } from 'react';
import {
  cargarRiesgoPaisCompleto,
  obtenerUltimoRiesgoPais,
  RiesgoPaisDataPoint,
  actualizarRiesgoPaisEnHistorico
} from '../services/riesgoPaisService';

interface UseRiesgoPaisReturn {
  datos: RiesgoPaisDataPoint[];
  ultimoValor: number | null;
  cargando: boolean;
  error: string | null;
  actualizar: () => Promise<void>;
  ultimaActualizacion: Date | null;
  mapaAnual: Map<number, number>;
}

/**
 * Hook para cargar y gestionar datos de riesgo país
 */
export function useRiesgoPais(autoCargar: boolean = true): UseRiesgoPaisReturn {
  const [datos, setDatos] = useState<RiesgoPaisDataPoint[]>([]);
  const [ultimoValor, setUltimoValor] = useState<number | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);

    try {
      const datosCargados = await cargarRiesgoPaisCompleto();
      setDatos(datosCargados);
      
      // Obtener último valor
      const ultimo = await obtenerUltimoRiesgoPais();
      setUltimoValor(ultimo);
      
      setUltimaActualizacion(new Date());
      
      console.log(`✅ Datos de riesgo país cargados: ${datosCargados.length} puntos`);
    } catch (err) {
      const mensajeError = err instanceof Error ? err.message : 'Error desconocido';
      setError(mensajeError);
      console.error('Error al cargar datos de riesgo país:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (autoCargar) {
      cargarDatos();
    }
  }, [autoCargar]);

  // Actualizar mapa anual para usar en historicalData
  const mapaAnual = actualizarRiesgoPaisEnHistorico(datos);

  return {
    datos,
    ultimoValor,
    cargando,
    error,
    actualizar: cargarDatos,
    ultimaActualizacion,
    mapaAnual,
  };
}

