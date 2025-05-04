// data/mockHistoricalData.ts

// Interfaz para un punto en la serie de tiempo
export interface TimePoint {
    periodo: string; // Podría ser 'Año X', 'YYYY-QX', 'YYYY-MM', etc.
    valor: number;
  }
  
  // Interfaz para todo el conjunto de datos históricos
  interface HistoricalData {
    [variableId: string]: TimePoint[]; // Un diccionario donde la clave es el ID de la variable
  }
  
  // Nuestros IDs de variables (usaremos estos en el código)
  export const VARIABLES_HISTORICAS_IDS = {
    GASTO_PUBLICO: 'gastoPublico',
    TASA_DESEMPLEO: 'tasaDesempleo',
    TASA_POBREZA: 'tasaPobreza',
    RESERVAS_USD: 'reservasUsd',
    INFLACION_ANUAL: 'inflacionAnual',
  } as const; // 'as const' para tipado más estricto
  
  // Nombres amigables para mostrar al usuario
  export const VARIABLES_HISTORICAS_NOMBRES: { [key: string]: string } = {
    [VARIABLES_HISTORICAS_IDS.GASTO_PUBLICO]: 'Gasto Público (% PBI)',
    [VARIABLES_HISTORICAS_IDS.TASA_DESEMPLEO]: 'Tasa de Desempleo (%)',
    [VARIABLES_HISTORICAS_IDS.TASA_POBREZA]: 'Tasa de Pobreza (%)',
    [VARIABLES_HISTORICAS_IDS.RESERVAS_USD]: 'Reservas Internacionales (USD Miles Millones)',
    [VARIABLES_HISTORICAS_IDS.INFLACION_ANUAL]: 'Inflación Anual (%)',
  };
  
  // DATOS SIMULADOS (Inventados para el ejemplo)
  // Simulamos 10 períodos (podrían ser años)
  const periodos = Array.from({ length: 10 }, (_, i) => `Año ${i + 1}`);
  
  export const mockHistoricalData: HistoricalData = {
    [VARIABLES_HISTORICAS_IDS.GASTO_PUBLICO]: periodos.map((p, i) => ({
      periodo: p,
      valor: parseFloat((20 + i * 0.5 + Math.random() * 2).toFixed(1)), // Tendencia levemente creciente con ruido
    })),
    [VARIABLES_HISTORICAS_IDS.TASA_DESEMPLEO]: periodos.map((p, i) => ({
      periodo: p,
      valor: parseFloat((10 - i * 0.3 + Math.random() * 3).toFixed(1)), // Tendencia decreciente con ruido
    })),
    [VARIABLES_HISTORICAS_IDS.TASA_POBREZA]: periodos.map((p, i) => ({
      periodo: p,
      valor: parseFloat((40 - i * 0.8 + Math.random() * 4).toFixed(1)), // Tendencia decreciente más marcada
    })),
    [VARIABLES_HISTORICAS_IDS.RESERVAS_USD]: periodos.map((p, i) => ({
      periodo: p,
      valor: parseFloat((30 + i * 1.5 - Math.random() * 5).toFixed(1)), // Tendencia creciente con más volatilidad
    })),
    [VARIABLES_HISTORICAS_IDS.INFLACION_ANUAL]: periodos.map((p, i) => ({
      periodo: p,
      valor: parseFloat((50 + Math.sin(i) * 15 + Math.random() * 10).toFixed(1)), // Más errática/cíclica
    })),
  };
  
  // Función helper para obtener los nombres de las variables disponibles
  export const getAvailableVariables = () => {
    return Object.entries(VARIABLES_HISTORICAS_NOMBRES).map(([id, nombre]) => ({
      id,
      nombre,
    }));
  };