// Calculador de correlaciones entre variables económicas
// Basado en análisis de sensibilidad histórica

import { HISTORICAL_DATA, HistoricalDataPoint } from '../data/historicalData';

export interface CorrelationMatrix {
  [sourceVariable: string]: {
    [targetVariable: string]: number;
  };
}

export interface VariableLimits {
  [variable: string]: {
    min: number;
    max: number;
  };
}

// Límites realistas para cada variable
export const VARIABLE_LIMITS: VariableLimits = {
  ipc: { min: 0, max: 500 },
  desempleo: { min: 2, max: 30 },
  inversion_bruta: { min: 5, max: 35 },
  consumo_energetico: { min: 1000, max: 4000 },
  merval: { min: 50, max: 100000 },
  exportaciones: { min: 3, max: 25 },
  riesgo_pais: { min: 100, max: 8000 },
  consumo_carne: { min: 20, max: 100 },
  automoviles_vendidos: { min: 100, max: 1000 },
  deuda_publica: { min: 20, max: 200 },
  pobreza: { min: 5, max: 70 },
  pib: { min: 100000, max: 800000 },
  salarios_reales: { min: 20, max: 200 },
  inflacion_futura: { min: 0, max: 300 },
  mortalidad_infantil: { min: 5, max: 30 },
};

// Función para calcular cambios porcentuales entre períodos consecutivos
function calculatePercentageChanges(data: HistoricalDataPoint[]): Array<{[key: string]: number}> {
  const changes: Array<{[key: string]: number}> = [];
  
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    const change: {[key: string]: number} = {};
    
    // Calcular cambio porcentual para cada variable
    Object.keys(prev).forEach(key => {
      if (key !== 'periodo' && key !== 'anio' && typeof prev[key as keyof HistoricalDataPoint] === 'number') {
        const prevValue = prev[key as keyof HistoricalDataPoint] as number;
        const currValue = curr[key as keyof HistoricalDataPoint] as number;
        
        if (prevValue !== 0) {
          change[key] = ((currValue - prevValue) / prevValue) * 100;
        } else {
          change[key] = 0;
        }
      }
    });
    
    changes.push(change);
  }
  
  return changes;
}

// Función para calcular coeficientes de correlación/sensibilidad mejorada
function calculateSensitivityCoefficients(changes: Array<{[key: string]: number}>): CorrelationMatrix {
  // Validar que haya datos
  if (changes.length === 0) {
    console.warn('⚠️ No hay cambios para calcular correlaciones. Retornando matriz vacía.');
    return {};
  }
  
  const variables = Object.keys(changes[0]);
  const matrix: CorrelationMatrix = {};
  
  // Inicializar matriz
  variables.forEach(sourceVar => {
    matrix[sourceVar] = {};
    variables.forEach(targetVar => {
      matrix[sourceVar][targetVar] = 0;
    });
  });
  
  // Calcular coeficientes para cada par de variables
  variables.forEach(sourceVar => {
    variables.forEach(targetVar => {
      if (sourceVar !== targetVar) {
        let sum = 0;
        let count = 0;
        const sensitivities: number[] = [];
        
        // Calcular cuánto cambia targetVar cuando sourceVar cambia 1%
        changes.forEach(change => {
          if (Math.abs(change[sourceVar]) > 0.1) { // Filtrar cambios muy pequeños
            const sensitivity = change[targetVar] / change[sourceVar];
            if (!isNaN(sensitivity) && isFinite(sensitivity) && Math.abs(sensitivity) < 100) {
              sensitivities.push(sensitivity);
              sum += sensitivity;
              count++;
            }
          }
        });
        
        if (count > 0) {
          // Usar mediana para ser más robusto ante outliers
          sensitivities.sort((a, b) => a - b);
          const median = sensitivities.length % 2 === 0
            ? (sensitivities[sensitivities.length / 2 - 1] + sensitivities[sensitivities.length / 2]) / 2
            : sensitivities[Math.floor(sensitivities.length / 2)];
          
          // Usar promedio pero con peso de la mediana para reducir outliers
          const promedio = sum / count;
          const coeficiente = (promedio * 0.7 + median * 0.3);
          
          // Amplificar coeficientes muy pequeños pero mantenerlos realistas
          if (Math.abs(coeficiente) < 0.01 && Math.abs(coeficiente) > 0.0001) {
            matrix[sourceVar][targetVar] = coeficiente * 10; // Amplificar conexiones débiles pero válidas
          } else {
            matrix[sourceVar][targetVar] = coeficiente;
          }
        }
      } else {
        matrix[sourceVar][targetVar] = 1; // Auto-correlación
      }
    });
  });
  
  // Asegurar que todas las propiedades existan antes de asignar valores reforzados
  if (!matrix.ipc) matrix.ipc = {};
  if (!matrix.desempleo) matrix.desempleo = {};
  if (!matrix.inversion_bruta) matrix.inversion_bruta = {};
  if (!matrix.riesgo_pais) matrix.riesgo_pais = {};
  if (!matrix.pib) matrix.pib = {};
  
  // Agregar relaciones económicas conocidas si los datos históricos no las capturan bien
  // FORZAR relaciones más fuertes para hacer la propagación más visible
  // IPC afecta muchas variables - aumentar coeficientes para hacer efectos más visibles
  if (Math.abs(matrix.ipc?.desempleo || 0) < 0.2) matrix.ipc.desempleo = 0.25;
  if (Math.abs(matrix.ipc?.inversion_bruta || 0) < 0.2) matrix.ipc.inversion_bruta = -0.3;
  if (Math.abs(matrix.ipc?.pib || 0) < 0.2) matrix.ipc.pib = -0.4;
  if (Math.abs(matrix.ipc?.salarios_reales || 0) < 0.2) matrix.ipc.salarios_reales = -0.35;
  if (Math.abs(matrix.ipc?.consumo_energetico || 0) < 0.2) matrix.ipc.consumo_energetico = -0.15;
  if (Math.abs(matrix.ipc?.merval || 0) < 0.2) matrix.ipc.merval = -0.2;

  // Desempleo afecta pobreza y otras variables - aumentar para hacer más visible
  if (Math.abs(matrix.desempleo?.pobreza || 0) < 0.2) matrix.desempleo.pobreza = 1.0;
  if (Math.abs(matrix.desempleo?.pib || 0) < 0.2) matrix.desempleo.pib = -0.5;
  if (Math.abs(matrix.desempleo?.salarios_reales || 0) < 0.2) matrix.desempleo.salarios_reales = -0.3;
  if (Math.abs(matrix.desempleo?.consumo_carne || 0) < 0.2) matrix.desempleo.consumo_carne = -0.2;

  // Inversión afecta PIB y empleo - aumentar para hacer más visible
  if (Math.abs(matrix.inversion_bruta?.pib || 0) < 0.2) matrix.inversion_bruta.pib = 0.8;
  if (Math.abs(matrix.inversion_bruta?.desempleo || 0) < 0.2) matrix.inversion_bruta.desempleo = -0.4;
  if (Math.abs(matrix.inversion_bruta?.salarios_reales || 0) < 0.2) matrix.inversion_bruta.salarios_reales = 0.3;
  if (Math.abs(matrix.inversion_bruta?.exportaciones || 0) < 0.2) matrix.inversion_bruta.exportaciones = 0.25;

  // Riesgo país afecta inversión y PIB - aumentar para hacer más visible
  if (Math.abs(matrix.riesgo_pais?.inversion_bruta || 0) < 0.2) matrix.riesgo_pais.inversion_bruta = -0.3;
  if (Math.abs(matrix.riesgo_pais?.pib || 0) < 0.2) matrix.riesgo_pais.pib = -0.35;
  if (Math.abs(matrix.riesgo_pais?.merval || 0) < 0.2) matrix.riesgo_pais.merval = -0.25;

  // Línea reforzada para relaciones económicas clave
  if (Math.abs(matrix.pib?.salarios_reales || 0) < 0.2) matrix.pib.salarios_reales = 0.4;
  if (Math.abs(matrix.pib?.consumo_carne || 0) < 0.2) matrix.pib.consumo_carne = 0.3;
  if (Math.abs(matrix.pib?.automoviles_vendidos || 0) < 0.2) matrix.pib.automoviles_vendidos = 0.35;

  return matrix;
}

// Función principal para generar matriz de correlación
export function generateCorrelationMatrix(data: HistoricalDataPoint[] = HISTORICAL_DATA): CorrelationMatrix {
  const changes = calculatePercentageChanges(data);
  return calculateSensitivityCoefficients(changes);
}

// Función para aplicar propagación en cascada mejorada
export function applyCascadePropagation(
  initialValues: {[key: string]: number},
  changedVariable: string,
  newValue: number,
  correlationMatrix: CorrelationMatrix,
  maxIterations: number = 5
): {[key: string]: number} {
  let currentValues = { ...initialValues };
  const originalValue = initialValues[changedVariable];

  const deltaPercent = originalValue !== 0 ? ((newValue - originalValue) / originalValue) * 100 : 0;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const newValues = { ...currentValues };
    let hasChanges = false;

    if (!correlationMatrix[changedVariable]) {
      return currentValues;
    }

    const correlations = correlationMatrix[changedVariable];

    if (correlations) {
      Object.keys(correlations).forEach(targetVar => {
        if (targetVar !== changedVariable) {
          const coefficient = correlations[targetVar];

          if (Math.abs(coefficient) > 0.001) {
            const changeAmount = deltaPercent * coefficient;
            const calculatedValue = currentValues[targetVar] * (1 + changeAmount / 100);

            const limits = VARIABLE_LIMITS[targetVar];
            if (limits) {
              const clampedValue = Math.max(limits.min, Math.min(limits.max, calculatedValue));
              const minChange = Math.max(0.01, Math.abs(currentValues[targetVar]) * 0.001);
              const actualChange = Math.abs(clampedValue - currentValues[targetVar]);

              if (actualChange > minChange) {
                newValues[targetVar] = clampedValue;
                hasChanges = true;
              }
            } else {
              newValues[targetVar] = calculatedValue;
              hasChanges = true;
            }
          }
        }
      });
    }

    newValues[changedVariable] = newValue;
    currentValues = newValues;

    if (!hasChanges) {
      break;
    }
  }

  return currentValues;
}

// Función para obtener coeficiente de correlación entre dos variables
export function getCorrelationCoefficient(
  sourceVar: string,
  targetVar: string,
  correlationMatrix: CorrelationMatrix
): number {
  return correlationMatrix[sourceVar]?.[targetVar] || 0;
}

// Función para validar valores dentro de límites
export function validateAndClampValues(values: {[key: string]: number}): {[key: string]: number} {
  const clampedValues: {[key: string]: number} = {};
  
  Object.keys(values).forEach(key => {
    const limits = VARIABLE_LIMITS[key];
    if (limits) {
      clampedValues[key] = Math.max(limits.min, Math.min(limits.max, values[key]));
    } else {
      clampedValues[key] = values[key];
    }
  });
  
  return clampedValues;
}

// Función para calcular pobreza como variable dependiente
// NOTA: Esta es solo UNA de las posibles variables calculadas. La app puede calcular cualquier variable dependiente.
export function calculatePoverty(values: {[key: string]: number}): number {
  const basePoverty = 38.8;
  
  // Factores que afectan la pobreza
  const ipcImpact = (values.ipc - 33.6) * 0.15;
  const desempleoImpact = (values.desempleo - 7.6) * 0.8;
  const inversionImpact = (values.inversion_bruta - 16.5) * -0.4;
  const consumoCarneImpact = (values.consumo_carne - 46.5) * -0.2;
  const automovilesImpact = (values.automoviles_vendidos - 420) * -0.02;
  const deudaPublicaImpact = (values.deuda_publica - 85) * 0.05;
  
  const calculatedPoverty = basePoverty + ipcImpact + desempleoImpact + inversionImpact + consumoCarneImpact + automovilesImpact + deudaPublicaImpact;
  
  return Math.max(5, Math.min(70, calculatedPoverty));
}

// Función genérica para calcular cualquier variable dependiente basada en otras variables
// Esto permite que la app calcule múltiples variables, no solo pobreza
export function calculateDependentVariable(
  variableName: string,
  values: {[key: string]: number}
): number {
  // Por ahora, solo implementamos cálculo de pobreza, pero esto puede extenderse
  if (variableName === 'pobreza') {
    return calculatePoverty(values);
  }
  
  // Aquí se pueden agregar más cálculos para otras variables dependientes
  // Por ejemplo: bienestar, crecimiento económico, etc.
  
  return values[variableName] || 0;
}
