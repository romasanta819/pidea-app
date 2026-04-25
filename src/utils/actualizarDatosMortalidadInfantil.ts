// Utilidad para actualizar datos históricos con mortalidad infantil oficial (Banco Mundial)

import { HISTORICAL_DATA, HistoricalDataPoint } from '../data/historicalData';
import { cargarMortalidadInfantilDEIS } from '../services/mortalidadInfantilService';

type FuenteMortalidad = 'deis' | 'cache' | 'original';

interface ActualizacionMortalidadResult {
  data: HistoricalDataPoint[];
  source: FuenteMortalidad;
  updatedAt: string | null;
}

const CACHE_KEY = 'polia.mortalidadInfantilDEIS.v1';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const nowIso = () => new Date().toISOString();

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    const storage = window.localStorage;
    const testKey = '__polia_storage_test__';
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
};

const readCache = (): ActualizacionMortalidadResult | null => {
  const storage = getStorage();
  if (!storage) return null;
  let raw: string | null = null;
  try {
    raw = storage.getItem(CACHE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { data: HistoricalDataPoint[]; updatedAt: string };
    if (!parsed?.data || !parsed?.updatedAt) return null;
    const age = Date.now() - new Date(parsed.updatedAt).getTime();
    if (Number.isNaN(age) || age > CACHE_TTL_MS) return null;
    return { data: parsed.data, source: 'cache', updatedAt: parsed.updatedAt };
  } catch {
    return null;
  }
};

const writeCache = (data: HistoricalDataPoint[]) => {
  const storage = getStorage();
  if (!storage) return;
  const payload = { data, updatedAt: nowIso() };
  try {
    storage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignorar errores de almacenamiento (modo privado, cuota, etc.)
  }
};

export const clearMortalidadInfantilCache = () => {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(CACHE_KEY);
  } catch {
    // Ignorar errores de almacenamiento
  }
};

/**
 * Actualiza los datos históricos con valores oficiales de mortalidad infantil.
 * Si no hay dato para un año, conserva el valor original.
 */
export async function actualizarDatosHistoricosConMortalidadInfantilReal(
  options: { forceRefresh?: boolean } = {},
): Promise<ActualizacionMortalidadResult> {
  console.log('🔄 Actualizando datos históricos con mortalidad infantil oficial...');

  if (!options.forceRefresh) {
    const cached = readCache();
    if (cached) {
      return cached;
    }
  }

  try {
    const mapaAnual = await cargarMortalidadInfantilDEIS();

    if (mapaAnual.size === 0) {
      console.warn('⚠️ No se pudieron cargar datos de mortalidad infantil. Manteniendo valores originales.');
      return { data: [...HISTORICAL_DATA], source: 'original', updatedAt: null };
    }

    const datosActualizados = HISTORICAL_DATA.map(punto => {
      const nuevoValor = mapaAnual.get(punto.anio);

      if (nuevoValor !== undefined) {
        return {
          ...punto,
          mortalidad_infantil: nuevoValor,
        };
      }

      return punto;
    });

    writeCache(datosActualizados);
    console.log('✅ Mortalidad infantil actualizada con datos oficiales.');
    return { data: datosActualizados, source: 'deis', updatedAt: nowIso() };
  } catch (error) {
    console.warn('⚠️ Error cargando mortalidad infantil. Manteniendo valores originales.', error);
    return { data: [...HISTORICAL_DATA], source: 'original', updatedAt: null };
  }
}
