import React, { useMemo, useState, useEffect, useCallback } from 'react';

// -------------------------------------------------------------------
// TIPOS Y DATASETS INTEGRADOS - SERIE DE POBREZA UNIFICADA (INDEC + ESTIMACIONES ACADÉMICAS 2007-2015)
// -------------------------------------------------------------------
interface PideaDataPoint {
  periodo: string;
  anio: number;
  pobreza: number; 
  ipc: number;
  desempleo: number;
  inversion_bruta: number; // Inversión Bruta Interna Fija / PIB
}

// NOTE: Pobreza sigue siendo necesaria para entrenar el modelo, por eso se mantiene en la data histórica.
// Serie de datos ajustada para suavizar anomalías (Desempleo 2023/2025 ajustado)
const INITIAL_RAW_DATA: PideaDataPoint[] = [
    { periodo: '1994-S2', anio: 1994, pobreza: 27.0, ipc: 3.9, desempleo: 12.2, inversion_bruta: 21.0 },
    { periodo: '1995-S2', anio: 1995, pobreza: 27.7, ipc: 1.6, desempleo: 16.6, inversion_bruta: 19.5 },
    { periodo: '1996-S2', anio: 1996, pobreza: 29.5, ipc: 0.1, desempleo: 14.3, inversion_bruta: 20.0 },
    { periodo: '1997-S2', anio: 1997, pobreza: 30.0, ipc: 0.5, desempleo: 13.7, inversion_bruta: 20.5 },
    { periodo: '1998-S2', anio: 1998, pobreza: 28.5, ipc: -0.9, desempleo: 13.2, inversion_bruta: 19.0 },
    { periodo: '1999-S2', anio: 1999, pobreza: 29.0, ipc: -1.8, desempleo: 14.0, inversion_bruta: 18.0 },
    { periodo: '2000-S2', anio: 2000, pobreza: 30.0, ipc: -0.7, desempleo: 15.5, inversion_bruta: 17.5 },
    { periodo: '2002-S2', anio: 2002, pobreza: 57.5, ipc: 40.9, desempleo: 20.8, inversion_bruta: 11.5 },
    { periodo: '2006-S2', anio: 2006, pobreza: 26.9, ipc: 9.8, desempleo: 8.5, inversion_bruta: 22.0 },
    
    // SERIE UNIFICADA (Estimaciones Académicas)
    { periodo: '2007-S2', anio: 2007, pobreza: 25.5, ipc: 15.0, desempleo: 8.0, inversion_bruta: 23.5 },
    { periodo: '2009-S2', anio: 2009, pobreza: 28.0, ipc: 18.0, desempleo: 8.7, inversion_bruta: 20.5 },
    { periodo: '2011-S2', anio: 2011, pobreza: 26.5, ipc: 24.5, desempleo: 7.2, inversion_bruta: 24.0 },
    { periodo: '2013-S2', anio: 2013, pobreza: 28.5, ipc: 28.3, desempleo: 6.9, inversion_bruta: 20.0 },
    { periodo: '2015-S2', anio: 2015, pobreza: 30.0, ipc: 26.9, desempleo: 6.5, inversion_bruta: 18.0 },
    
    // Post-Gap (Data Validada y ajustada)
    { periodo: '2016-S2', anio: 2016, pobreza: 32.2, ipc: 40.5, desempleo: 8.5, inversion_bruta: 17.5 },
    { periodo: '2018-S2', anio: 2018, pobreza: 35.5, ipc: 47.6, desempleo: 9.1, inversion_bruta: 18.0 },
    { periodo: '2020-S2', anio: 2020, pobreza: 42.0, ipc: 36.1, desempleo: 11.0, inversion_bruta: 15.5 }, // Anomalía: se mantendrá en el gráfico, pero se excluye del training.
    { periodo: '2023-S2', anio: 2023, pobreza: 44.5, ipc: 211.4, desempleo: 8.5, inversion_bruta: 18.5 }, // Anomalía: se mantendrá en el gráfico, pero se excluye del training.
    { periodo: '2025-S1', anio: 2025, pobreza: 38.8, ipc: 33.6, desempleo: 7.6, inversion_bruta: 16.5 },
];

const LAST_DATA_POINT = INITIAL_RAW_DATA[INITIAL_RAW_DATA.length - 1];
const BASE_POVERTY = LAST_DATA_POINT.pobreza; // Pobreza base actual

type FactorName = 'ipc' | 'desempleo' | 'inversion_bruta';
type OutputName = 'pobreza';
type VariableName = FactorName | OutputName;

// Definiciones de variables globales para React y lógica
const activeFactors: FactorName[] = ['ipc', 'desempleo', 'inversion_bruta'];
const allVariables: VariableName[] = ['pobreza', 'desempleo', 'ipc', 'inversion_bruta'];
const chartVariables: VariableName[] = ['desempleo', 'ipc', 'inversion_bruta']; // Pobreza excluida del gráfico


interface TrainingMetrics {
    correlations: { [key in VariableName]: number };
    // Normalization data for graph scaling (MinMax normalization across the whole series)
    normalization: { [key in VariableName]: { min: number, max: number } };
    
    // Means and StdDevs for Z-Score calculation
    meanPoverty: number; stdDevPoverty: number;
    meanIPC: number; stdDevIPC: number;
    meanDesempleo: number; stdDevDesempleo: number;
    meanInversion: number; stdDevInversion: number;
    
    // Correlaciones Cruzadas (PARA DIAGNÓSTICO Y COMPENSACIÓN)
    corIPCvsDesempleo: number;
    corIPCvsIBIF: number;
    corDesempleovsIBIF: number;
    
    // Nuevos coeficientes avanzados
    partialCorrelations: { [key: string]: { [key: string]: number } };
    ridgeCoefficients: { [key: string]: { [key: string]: number } };
    varCoefficients: { [key: string]: { [key: string]: number } };
}

const varRangeMap: { [key in VariableName]: { min: number, max: number, step: number } } = {
    desempleo: { min: 5, max: 25, step: 0.1 },
    ipc: { min: 5, max: 250, step: 1 },
    inversion_bruta: { min: 10, max: 40, step: 0.5 }, 
    pobreza: { min: 20, max: 60, step: 0.1 }, 
};

// -------------------------------------------------------------------
// 1. FÓRMULAS AUXILIARES Y DE ENTRENAMIENTO 
// -------------------------------------------------------------------

const calculateMean = (arr: number[]) => {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

const calculateStdDev = (arr: number[], mean: number) => {
    if (arr.length < 2) return 0;
    const squaredDifferences = arr.map(val => (val - mean) ** 2);
    return Math.sqrt(squaredDifferences.reduce((sum, val) => sum + val, 0) / (arr.length - 1));
};

/**
 * Calcula la correlación de Pearson entre dos variables.
 */
const calculatePearsonCorrelation = (x: number[], y: number[]) => {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const meanX = calculateMean(x);
    const meanY = calculateMean(y);
    const stdDevX = calculateStdDev(x, meanX);
    const stdDevY = calculateStdDev(y, meanY);

    if (stdDevX === 0 || stdDevY === 0) return 0; 

    let covariance = 0;
    for (let i = 0; i < n; i++) {
        covariance += (x[i] - meanX) * (y[i] - meanY);
    }
    
    return covariance / ((n - 1) * stdDevX * stdDevY);
};

/**
 * Calcula la correlación parcial entre x e y controlando por z.
 * Elimina el efecto de la variable z para obtener la correlación "pura" entre x e y.
 */
const calculatePartialCorrelation = (x: number[], y: number[], z: number[]) => {
    if (x.length !== y.length || x.length !== z.length || x.length < 3) return 0;

    const corrXY = calculatePearsonCorrelation(x, y);
    const corrXZ = calculatePearsonCorrelation(x, z);
    const corrYZ = calculatePearsonCorrelation(y, z);

    const numerator = corrXY - (corrXZ * corrYZ);
    const denominator = Math.sqrt((1 - corrXZ * corrXZ) * (1 - corrYZ * corrYZ));

    if (denominator === 0) return 0;
    
    return numerator / denominator;
};

/**
 * Calcula la matriz de correlaciones parciales entre todas las variables.
 */
const calculatePartialCorrelationMatrix = (data: PideaDataPoint[]) => {
    const variables: VariableName[] = ['ipc', 'desempleo', 'inversion_bruta'];
    const matrix: { [key: string]: { [key: string]: number } } = {};

    variables.forEach(var1 => {
        matrix[var1] = {};
        variables.forEach(var2 => {
            if (var1 !== var2) {
                const thirdVar = variables.find(v => v !== var1 && v !== var2)!;
                // @ts-ignore
                const values1 = data.map(d => d[var1]);
                // @ts-ignore
                const values2 = data.map(d => d[var2]);
                // @ts-ignore
                const values3 = data.map(d => d[thirdVar]);
                
                matrix[var1][var2] = calculatePartialCorrelation(values1, values2, values3);
            } else {
                matrix[var1][var2] = 1.0;
            }
        });
    });

    return matrix;
};

/**
 * Implementa regresión ridge para calcular coeficientes robustos entre variables.
 * Evita sobreajuste usando regularización L2.
 */
const calculateRidgeRegression = (X: number[][], y: number[], lambda: number = 0.1) => {
    const n = X.length;
    const p = X[0].length;
    
    if (n < p + 1) return new Array(p).fill(0); // No hay suficientes datos
    
    // Crear matriz de diseño con intercepto
    const XWithIntercept = X.map(row => [1, ...row]);
    
    // Calcular X'X + λI
    const XTX = new Array(p + 1).fill(null).map(() => new Array(p + 1).fill(0));
    for (let i = 0; i < p + 1; i++) {
        for (let j = 0; j < p + 1; j++) {
            for (let k = 0; k < n; k++) {
                XTX[i][j] += XWithIntercept[k][i] * XWithIntercept[k][j];
            }
            // Agregar regularización L2 (excepto para el intercepto)
            if (i === j && i > 0) {
                XTX[i][j] += lambda;
            }
        }
    }
    
    // Calcular X'y
    const XTy = new Array(p + 1).fill(0);
    for (let i = 0; i < p + 1; i++) {
        for (let k = 0; k < n; k++) {
            XTy[i] += XWithIntercept[k][i] * y[k];
        }
    }
    
    // Resolver sistema (X'X + λI)β = X'y usando eliminación gaussiana
    const coefficients = solveLinearSystem(XTX, XTy);
    
    // Retornar solo los coeficientes de las variables (sin intercepto)
    return coefficients.slice(1);
};

/**
 * Resuelve un sistema de ecuaciones lineales usando eliminación gaussiana.
 */
const solveLinearSystem = (A: number[][], b: number[]) => {
    const n = A.length;
    const augmented = A.map((row, i) => [...row, b[i]]);
    
    // Eliminación hacia adelante
    for (let i = 0; i < n; i++) {
        // Buscar el pivote
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
                maxRow = k;
            }
        }
        
        // Intercambiar filas
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
        
        // Hacer ceros debajo del pivote
        for (let k = i + 1; k < n; k++) {
            const factor = augmented[k][i] / augmented[i][i];
            for (let j = i; j <= n; j++) {
                augmented[k][j] -= factor * augmented[i][j];
            }
        }
    }
    
    // Sustitución hacia atrás
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = augmented[i][n];
        for (let j = i + 1; j < n; j++) {
            x[i] -= augmented[i][j] * x[j];
        }
        x[i] /= augmented[i][i];
    }
    
    return x;
};

/**
 * Calcula coeficientes de regresión ridge para todas las combinaciones de variables.
 */
const calculateRidgeCoefficients = (data: PideaDataPoint[]) => {
    const variables: VariableName[] = ['ipc', 'desempleo', 'inversion_bruta'];
    const coefficients: { [key: string]: { [key: string]: number } } = {};
    
    variables.forEach(targetVar => {
        coefficients[targetVar] = {};
        const otherVars = variables.filter(v => v !== targetVar);
        
        // Preparar datos para regresión
        const X = data.map(d => otherVars.map(v => d[v as keyof PideaDataPoint] as number));
        const y = data.map(d => d[targetVar as keyof PideaDataPoint] as number);
        
        // Calcular coeficientes ridge
        const ridgeCoeffs = calculateRidgeRegression(X, y, 0.1);
        
        otherVars.forEach((varName, index) => {
            coefficients[targetVar][varName] = ridgeCoeffs[index];
        });
    });
    
    return coefficients;
};

/**
 * Implementa un modelo VAR (Vector Autoregression) simple con lag=1.
 * Captura dependencias temporales entre las variables económicas.
 */
const calculateVARModel = (data: PideaDataPoint[]) => {
    const variables: VariableName[] = ['ipc', 'desempleo', 'inversion_bruta'];
    const varCoefficients: { [key: string]: { [key: string]: number } } = {};
    
    // Preparar datos para VAR (necesitamos al menos 2 períodos)
    if (data.length < 2) {
        variables.forEach(var1 => {
            varCoefficients[var1] = {};
            variables.forEach(var2 => {
                varCoefficients[var1][var2] = 0;
            });
        });
        return varCoefficients;
    }
    
    variables.forEach(targetVar => {
        varCoefficients[targetVar] = {};
        
        // Para cada variable objetivo, calcular cómo depende de todas las variables (incluida ella misma) en t-1
        const X: number[][] = []; // Variables en t-1
        const y: number[] = [];   // Variable objetivo en t
        
        for (let i = 1; i < data.length; i++) {
            const prevData = data[i - 1];
            const currData = data[i];
            
            const prevValues = variables.map(v => prevData[v as keyof PideaDataPoint] as number);
            const currValue = currData[targetVar as keyof PideaDataPoint] as number;
            
            X.push(prevValues);
            y.push(currValue);
        }
        
        // Usar regresión ridge para calcular coeficientes VAR
        const varCoeffs = calculateRidgeRegression(X, y, 0.05); // Lambda más pequeño para VAR
        
        variables.forEach((varName, index) => {
            varCoefficients[targetVar][varName] = varCoeffs[index];
        });
    });
    
    return varCoefficients;
};

/**
 * Predice el siguiente valor de una variable usando el modelo VAR.
 */
const predictWithVAR = (
    varModel: { [key: string]: { [key: string]: number } },
    currentValues: { ipc: number, desempleo: number, inversion_bruta: number },
    targetVariable: FactorName
): number => {
    const variables: VariableName[] = ['ipc', 'desempleo', 'inversion_bruta'];
    const coefficients = varModel[targetVariable];
    
    let prediction = 0;
    variables.forEach((varName, index) => {
        const value = currentValues[varName as keyof typeof currentValues];
        prediction += coefficients[varName] * value;
    });
    
    return prediction;
};

/**
 * Normaliza un valor entre 0 y 100 usando el RANGO HISTÓRICO INDIVIDUAL de la variable.
 * Esto asegura que todas las curvas sean visibles sin ser aplastadas por el IPC.
 */
const normalizeValue = (value: number, name: VariableName, norm: TrainingMetrics['normalization']): number => {
    const { min, max } = norm[name];
    
    // Normalización para el gráfico: usa el rango histórico de la variable.
    if (max === min) return 50; 
    return 100 * ((value - min) / (max - min));
};

// Convierte un cambio porcentual a una escala cualitativa simple
const getQualitativeChange = (value: number) => {
    const absValue = Math.abs(value);
    const direction = value > 0 ? 'Aumento' : value < 0 ? 'Disminución' : 'Estable';

    if (absValue >= 10) return `${direction} ALTA`; // Movimiento muy grande (ej. 10%+)
    if (absValue >= 5) return `${direction} Media`; // Movimiento significativo
    if (absValue >= 1) return `${direction} Baja`; // Movimiento notable
    return 'Estable (0%)';
};


const getTrainingMetrics = (data: PideaDataPoint[]): TrainingMetrics => {
    // Excluir datos anómalos de 2020 y 2023 del entrenamiento
    const stableData = data.filter(d => d.anio !== 2020 && d.anio !== 2023);
    
    const variables: VariableName[] = ['pobreza', 'ipc', 'desempleo', 'inversion_bruta'];
    const correlations: { [key in VariableName]: number } = { pobreza: 1.0, ipc: 0, desempleo: 0, inversion_bruta: 0 };
    const normalization: TrainingMetrics['normalization'] = {
        pobreza: { min: 0, max: 0 }, ipc: { min: 0, max: 0 }, desempleo: { min: 0, max: 0 }, inversion_bruta: { min: 0, max: 0 }
    };

    // Calcular Normalización (Min/Max)
    variables.forEach(name => {
        // @ts-ignore
        const values = data.map(d => d[name]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        normalization[name] = { min, max };
    });

    // Calcular Correlaciones (usando Pobreza como ancla)
    const povertyValues = stableData.map(d => d.pobreza);
    const ipcValues = stableData.map(d => d.ipc);
    const desempleoValues = stableData.map(d => d.desempleo);
    const inversionValues = stableData.map(d => d.inversion_bruta);
    
    correlations.ipc = calculatePearsonCorrelation(povertyValues, ipcValues);
    correlations.desempleo = calculatePearsonCorrelation(povertyValues, desempleoValues);
    correlations.inversion_bruta = calculatePearsonCorrelation(povertyValues, inversionValues);

    // Calcular Correlaciones Cruzadas (DIAGNÓSTICO Y COMPENSACIÓN)
    const corIPCvsDesempleo = calculatePearsonCorrelation(ipcValues, desempleoValues);
    const corIPCvsIBIF = calculatePearsonCorrelation(ipcValues, inversionValues);
    const corDesempleovsIBIF = calculatePearsonCorrelation(desempleoValues, inversionValues);

    // Calcular nuevos coeficientes avanzados
    const partialCorrelations = calculatePartialCorrelationMatrix(stableData);
    const ridgeCoefficients = calculateRidgeCoefficients(stableData);
    const varCoefficients = calculateVARModel(stableData);

    return { 
        correlations,
        normalization,
        // Correlaciones Cruzadas
        corIPCvsDesempleo, 
        corIPCvsIBIF, 
        corDesempleovsIBIF,
        // Calcular Medias y Desviaciones para Z-Score (Propagación)
        meanPoverty: calculateMean(povertyValues),
        stdDevPoverty: calculateStdDev(povertyValues, calculateMean(povertyValues)),
        meanIPC: calculateMean(ipcValues),
        stdDevIPC: calculateStdDev(ipcValues, calculateMean(ipcValues)),
        meanDesempleo: calculateMean(desempleoValues),
        stdDevDesempleo: calculateStdDev(desempleoValues, calculateMean(desempleoValues)),
        meanInversion: calculateMean(inversionValues),
        stdDevInversion: calculateStdDev(inversionValues, calculateMean(inversionValues)),
        // Nuevos coeficientes avanzados
        partialCorrelations,
        ridgeCoefficients,
        varCoefficients,
    };
};

// Helper para calcular el Z-Score de una variable
const shockMetric = (name: VariableName, value: number, metrics: TrainingMetrics) => {
    const mean = name === 'ipc' ? metrics.meanIPC : name === 'desempleo' ? metrics.meanDesempleo : name === 'inversion_bruta' ? metrics.meanInversion : metrics.meanPoverty;
    const stdDev = name === 'ipc' ? metrics.stdDevIPC : name === 'desempleo' ? metrics.stdDevDesempleo : name === 'inversion_bruta' ? metrics.meanInversion : metrics.stdDevPoverty; 
    return stdDev === 0 ? 0 : (value - mean) / stdDev;
};


// -------------------------------------------------------------------
// 2. FÓRMULAS DE PREDICCIÓN Y PROPAGACIÓN
// -------------------------------------------------------------------

/**
 * MODO FORWARD (Predicción normal): Dados 3 inputs, calcula Pobreza.
 */
const estimatePovertyForward = (ipcInput: number, desempleoInput: number, inversionInput: number, metrics: TrainingMetrics) => {
    const { meanPoverty, stdDevPoverty, correlations, meanIPC, stdDevIPC, meanDesempleo, stdDevDesempleo, meanInversion, stdDevInversion } = metrics;
    
    // Estandarizar los inputs (Z-Scores)
    const zIPC = stdDevIPC === 0 ? 0 : (ipcInput - meanIPC) / stdDevIPC;
    const zDesempleo = stdDevDesempleo === 0 ? 0 : (desempleoInput - meanDesempleo) / stdDevDesempleo;
    const zInversion = stdDevInversion === 0 ? 0 : (inversionInput - meanInversion) / stdDevInversion; 
    
    // Regresión Múltiple Simplificada (suma ponderada de impactos)
    let estimatedZScore = 
        (correlations.ipc * zIPC) + 
        (correlations.desempleo * zDesempleo) + 
        (correlations.inversion_bruta * zInversion); 
    
    // Desestandarizar
    let finalEstimate = meanPoverty + (estimatedZScore * stdDevPoverty);
    
    if (isNaN(finalEstimate) || !isFinite(finalEstimate)) return NaN;
    
    return Math.max(0, Math.min(100, finalEstimate));
};

/**
 * PROPAGACIÓN AUTOMÁTICA AVANZADA: Usa correlaciones parciales, regresión ridge y VAR
 * para ajustar automáticamente las otras dos variables cuando cambia una.
 */
const propagateShockAutomatic = (
    metrics: TrainingMetrics,
    currentFactors: { ipc: number, desempleo: number, inversion_bruta: number },
    changedVariable: FactorName
): { ipc: number, desempleo: number, inversion_bruta: number, pobreza: number } => {
    
    const otherVariables = activeFactors.filter(v => v !== changedVariable);
    let newFactors: { ipc: number, desempleo: number, inversion_bruta: number } = { ...currentFactors };

    // 1. Calcular la magnitud del cambio en Z-scores
    const zChangeMagnitude = shockMetric(changedVariable, currentFactors[changedVariable], metrics) - 
                            shockMetric(changedVariable, LAST_DATA_POINT[changedVariable] as number, metrics);

    // 2. Para cada variable que no cambió, calcular el ajuste usando múltiples métodos
    for (const targetVar of otherVariables) {
        // Método 1: Correlación parcial (elimina efectos espurios)
        const partialCorr = metrics.partialCorrelations[changedVariable][targetVar];
        
        // Método 2: Coeficiente ridge (robusto contra sobreajuste)
        const ridgeCoeff = metrics.ridgeCoefficients[targetVar][changedVariable];
        
        // Método 3: Predicción VAR (dependencias temporales)
        const varPrediction = predictWithVAR(metrics.varCoefficients, currentFactors, targetVar);
        const varCoeff = metrics.varCoefficients[targetVar][changedVariable];
        
        // Combinar métodos con pesos (puedes ajustar estos pesos)
        const weightPartial = 0.4;
        const weightRidge = 0.4;
        const weightVAR = 0.2;
        
        const combinedCoefficient = (weightPartial * partialCorr) + (weightRidge * ridgeCoeff) + (weightVAR * varCoeff);
        
        // 3. Aplicar el ajuste
        const mean = targetVar === 'ipc' ? metrics.meanIPC : 
                    targetVar === 'desempleo' ? metrics.meanDesempleo : metrics.meanInversion;
        const stdDev = targetVar === 'ipc' ? metrics.stdDevIPC : 
                      targetVar === 'desempleo' ? metrics.stdDevDesempleo : metrics.stdDevInversion;
        
        const baseValue = LAST_DATA_POINT[targetVar] as number;
        const zBase = shockMetric(targetVar, baseValue, metrics);
        const zAdjustment = combinedCoefficient * zChangeMagnitude;
        const zNew = zBase + zAdjustment;
        
        const newValue = (zNew * stdDev) + mean;
        
        // 4. Aplicar límites y actualizar
        if (!isNaN(newValue) && isFinite(newValue)) {
            // @ts-ignore
            newFactors[targetVar] = Math.max(varRangeMap[targetVar].min, Math.min(varRangeMap[targetVar].max, newValue));
        }
    }
    
    // 5. Calcular nueva pobreza con todos los valores ajustados
    const nuevaPobreza = estimatePovertyForward(newFactors.ipc, newFactors.desempleo, newFactors.inversion_bruta, metrics);
    
    return { ...newFactors, pobreza: nuevaPobreza };
};

/**
 * MODO PROPAGACIÓN PURA: Mueve las variables AJUSTABLES para que el sistema mantenga
 * las correlaciones históricas, reflejando la tendencia más probable.
 * IMPLEMENTA LA VISIÓN ESTRATÉGICA: CORRELACIÓN CRUZADA
 * @deprecated - Reemplazado por propagateShockAutomatic
 */
const propagateShockAndCompensate = (
    metrics: TrainingMetrics,
    currentFactors: { ipc: number, desempleo: number, inversion_bruta: number }, 
    shockFactors: FactorName[], 
): { ipc: number, desempleo: number, inversion_bruta: number, pobreza: number } | null => {
    
    // --- Lógica del Shock y Compensación (Tendencia Pura) ---
    const corIPCvsDesempleo = metrics.corIPCvsDesempleo; 
    const corDesempleovsIBIF = metrics.corDesempleovsIBIF; 
    const corIPCvsIBIF = metrics.corIPCvsIBIF;

    
    // Solo permitimos 1 Shock para la compensación de 2 variables
    const shockVariable = shockFactors[0];
    const compensatingFactors = activeFactors.filter(v => !shockFactors.includes(v));
    
    if (shockFactors.length !== 1 || compensatingFactors.length !== 2) return null;

    // 1. CALCULAR LA MAGNITUD DEL SHOCK
    const zShockMagnitude = shockMetric(shockVariable, currentFactors[shockVariable], metrics) - 
                            shockMetric(shockVariable, LAST_DATA_POINT[shockVariable] as number, metrics);

    if (Math.abs(zShockMagnitude) < 0.01) {
        // Si no hay shock significativo, devolver solo la predicción de pobreza
        return {
            ...currentFactors,
            pobreza: estimatePovertyForward(currentFactors.ipc, currentFactors.desempleo, currentFactors.inversion_bruta, metrics)
        };
    } 

    // 2. CALCULAR AJUSTES PARA LAS OTRAS DOS VARIABLES
    let newFactors: { ipc: number, desempleo: number, inversion_bruta: number } = { ...currentFactors };

    // Usamos el factor de Shock para mover las variables compensatorias
    for (const name of compensatingFactors) {
        // Obtenemos el coeficiente de correlación directa para la propagación
        let correlationCoefficient = 0;
        
        if (shockVariable === 'desempleo' && name === 'ipc') correlationCoefficient = corIPCvsDesempleo; 
        else if (shockVariable === 'desempleo' && name === 'inversion_bruta') correlationCoefficient = corDesempleovsIBIF; 
        else if (shockVariable === 'ipc' && name === 'desempleo') correlationCoefficient = corIPCvsDesempleo; 
        else if (shockVariable === 'ipc' && name === 'inversion_bruta') correlationCoefficient = corIPCvsIBIF;
        else if (shockVariable === 'inversion_bruta' && name === 'desempleo') correlationCoefficient = corDesempleovsIBIF;
        else if (shockVariable === 'inversion_bruta' && name === 'ipc') correlationCoefficient = corIPCvsIBIF;
        
        if (correlationCoefficient === 0) continue;

        const mean = name === 'ipc' ? metrics.meanIPC : name === 'desempleo' ? metrics.meanDesempleo : metrics.meanInversion;
        const stdDev = name === 'ipc' ? metrics.stdDevIPC : name === 'desempleo' ? metrics.stdDevDesempleo : metrics.stdDevInversion;
        const baseValue = LAST_DATA_POINT[name] as number;

        // Propagación: (Beta de correlación * Magnitud del Shock) + Base del valor normalizado (Z-Score)
        const zBase = shockMetric(name, baseValue, metrics);
        const zAdjustment = correlationCoefficient * zShockMagnitude;
        
        const zNew = zBase + zAdjustment;
        
        const newValue = (zNew * stdDev) + mean;

        // 3. Aplicar Límites
        if (!isNaN(newValue) && isFinite(newValue)) {
            // @ts-ignore
            newFactors[name] = Math.max(varRangeMap[name].min, Math.min(varRangeMap[name].max, newValue));
        } else {
            return null;
        }
    }
    
    // 4. La Pobreza (resultado pasivo) se calcula con la nueva regresión.
    const nuevaPobreza = estimatePovertyForward(newFactors.ipc, newFactors.desempleo, newFactors.inversion_bruta, metrics);

    return { ...newFactors, pobreza: nuevaPobreza };
};


// -------------------------------------------------------------------
// 3. LOGÍSTICA DEL HISTORIAL (Para el Gráfico)
// -------------------------------------------------------------------

// Logística para rellenar el hueco
const fillHistoricalData = (data: PideaDataPoint[], metrics: TrainingMetrics): PideaDataPoint[] => {
    // La data ya es continua, no hay hueco que rellenar
    return data;
}


// -------------------------------------------------------------------
// 4. COMPONENTE DE GRÁFICO (SVG Nativo)
// -------------------------------------------------------------------

interface ChartProps {
    data: PideaDataPoint[];
    simulationData: { [key in VariableName]: number };
    metrics: TrainingMetrics;
}

const colors: { [key in VariableName]: string } = {
    pobreza: '#ef4444', // Rojo (Pobreza)
    desempleo: '#10b981', // Verde (Desempleo)
    ipc: '#f59e0b', // Amarillo/Naranja (Inflación)
    inversion_bruta: '#8b5cf6', // Púrpura (IBIF)
};

const PovertyChart: React.FC<ChartProps> = ({ data, simulationData, metrics }) => {
    const width = 850; 
    const height = 300;
    const margin = 35; 
    const chartWidth = width - 2 * margin;
    const chartHeight = height - 2 * margin;
    
    const maxAnio = data[data.length - 1].anio;
    const projectionAnio = maxAnio + 1; // Un año al futuro

    // Escala X (Años)
    const scaleX = (anio: number) => margin + ((anio - data[0].anio) / (projectionAnio - data[0].anio)) * chartWidth;
    
    // Escala Y (Normalizada 0-100)
    const scaleY = (normalizedValue: number) => height - margin - (normalizedValue / 100) * chartHeight;

    // --- LÓGICA DE DIBUJO DE CURVAS ---
    const drawLine = (name: VariableName) => {
        // Generar la ruta histórica normalizada
        const historyPath = data.map((d, i) => {
            // @ts-ignore
            const normalizedY = normalizeValue(d[name], name, metrics.normalization);
            const x = scaleX(d.anio);
            const y = scaleY(normalizedY);
            return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
        }).join(' ');

        // Generar el punto de proyección
        const lastDataPoint = data[data.length - 1];
        // @ts-ignore
        const lastNormalizedY = normalizeValue(lastDataPoint[name], name, metrics.normalization);
        // @ts-ignore
        const currentNormalizedY = normalizeValue(simulationData[name], name, metrics.normalization);
        
        const lastX = scaleX(lastDataPoint.anio);
        const lastY = scaleY(lastNormalizedY);
        const currentX = scaleX(projectionAnio);
        const currentY = scaleY(currentNormalizedY);

        // Path de proyección (línea de puntos)
        const projectionPath = `M ${lastX},${lastY} L ${currentX},${currentY}`;

        return (
            <g key={name}>
                {/* 1. Línea Histórica Sólida */}
                <path d={historyPath} fill="none" stroke={colors[name]} strokeWidth="2.5" />
                
                {/* 2. Línea de Pronóstico (Puntos) */}
                <path d={projectionPath} fill="none" stroke={colors[name]} strokeWidth="2.5" strokeDasharray="5 5" />
                
                {/* 3. Punto Final de Simulación */}
                <circle cx={currentX} cy={currentY} r="4" fill={colors[name]} stroke="white" strokeWidth="1.5" />
            </g>
        );
    };

    // --- Ejes y Etiquetas ---
    const xTicks = data.filter(d => d.periodo.endsWith('-S2') || d.anio % 5 === 0).map(d => ({ 
        x: scaleX(d.anio),
        label: d.anio.toString(), // Corregido a string para .includes()
    }));
    xTicks.push({ x: scaleX(projectionAnio), label: projectionAnio.toString() + ' (PRON.)' });

    // Lista de variables a dibujar (EXCLUYE POBREZA)
    // Usamos chartVariables: ['desempleo', 'ipc', 'inversion_bruta']
    const variablesToDraw = chartVariables; 

    return (
        <div className="flex justify-center mt-6">
            <svg viewBox={`0 0 ${width + 70} ${height + 20}`} className="w-full max-w-4xl border border-gray-300 bg-white rounded-lg shadow-xl">
                
                {/* Eje Y (Etiquetas de Normalización) */}
                <line x1={margin} y1={height - margin} x2={margin} y2={margin} stroke="#333" />
                <text x={margin - 5} y={margin + 5} textAnchor="end" fontSize="10" fill="#666">
                    MÁX. TENDENCIA
                </text>
                <text x={margin - 5} y={height - margin + 5} textAnchor="end" fontSize="10" fill="#666">
                    MÍN. TENDENCIA
                </text>
                <text x={margin - 15} y={height / 2} textAnchor="middle" transform={`rotate(-90 ${margin - 15} ${height / 2})`} fontSize="12" fill="#333" fontWeight="bold">
                    TENDENCIA NORMALIZADA (0-100)
                </text>

                {/* Eje X (Años) */}
                <line x1={margin} y1={height - margin} x2={width + 50} y2={height - margin} stroke="#333" />
                {xTicks.map(tick => (
                    <text key={tick.label} x={tick.x} y={height - margin + 15} textAnchor="middle" fontSize="10" fill="#666" transform={tick.label.includes('PRON.') ? `rotate(30 ${tick.x} ${height - margin + 15})` : ''}>
                        {tick.label}
                    </text>
                ))}


                {/* Dibujar las 3 Curvas Activas */}
                {variablesToDraw.map(name => (
                    // @ts-ignore
                    drawLine(name)
                ))}

                {/* Leyenda */}
                 <g transform={`translate(${width - margin + 20}, ${margin})`} fontSize="10" className="font-bold">
                    <rect x="-5" y="-5" width="120" height="75" fill="white" stroke="#ccc" rx="5"/>
                    <text x="5" y="10" fill={colors.desempleo}>Desempleo</text>
                    <text x="5" y="30" fill={colors.ipc}>Inflación (IPC)</text>
                    <text x="5" y="50" fill={colors.inversion_bruta}>Inversión Bruta (IBIF)</text>
                    <text x="5" y="70" fill="#333" fontSize="8" className="font-normal">(Línea de puntos = Pronóstico)</text>
                </g>

            </svg>
        </div>
    );
};

// -------------------------------------------------------------------
// 5. COMPONENTE REACT (Simulador Principal)
// -------------------------------------------------------------------

const Laboratorio = () => {
    
    // El state ya no incluye pobreza como slider/input
    const [simulationData, setSimulationData] = useState({
        ipc: LAST_DATA_POINT.ipc || 33.6, 
        desempleo: LAST_DATA_POINT.desempleo || 7.6, 
        inversion_bruta: LAST_DATA_POINT.inversion_bruta || 16.5, 
        pobreza: LAST_DATA_POINT.pobreza || 31.6, // Se mantiene solo para el output inicial
    });
    
    const [correlations, setCorrelations] = useState({ ipc: 0, desempleo: 0, inversion_bruta: 0, pobreza: 0 }); 
    const [lastChangedVariable, setLastChangedVariable] = useState<FactorName | null>(null); 
    
    const trainingMetrics = useMemo(() => getTrainingMetrics(INITIAL_RAW_DATA), []);
    const filledHistoricalData = useMemo(() => fillHistoricalData(INITIAL_RAW_DATA, trainingMetrics), [trainingMetrics]);
    
    // --- LÓGICA CLAVE DE CÁLCULO ---
    const calculateSimulation = useCallback((data: typeof simulationData, changedVar: FactorName | null) => {
        
        let newSimulationData = { ...data };
        
        if (changedVar && activeFactors.includes(changedVar)) {
            // PROPAGACIÓN AUTOMÁTICA: Usar el nuevo algoritmo avanzado
            const currentFactors = { ipc: data.ipc, desempleo: data.desempleo, inversion_bruta: data.inversion_bruta };
            const propagationResult = propagateShockAutomatic(trainingMetrics, currentFactors, changedVar);
            newSimulationData = { ...propagationResult };
        } else {
            // Si no hay cambio específico, solo recalcular pobreza
            newSimulationData.pobreza = estimatePovertyForward(data.ipc, data.desempleo, data.inversion_bruta, trainingMetrics);
        }

        return { newSimulationData };
        
    }, [trainingMetrics]);

    
    // 3. useEffect principal para la predicción dinámica automática
    useEffect(() => {
        // @ts-ignore
        setCorrelations(trainingMetrics.correlations);
        
        // PROPAGACIÓN AUTOMÁTICA: Cualquier cambio en una variable dispara ajuste automático
        setSimulationData(prev => {
            const { newSimulationData } = calculateSimulation(prev, lastChangedVariable);
            return newSimulationData;
        });

    }, [simulationData.ipc, simulationData.desempleo, simulationData.inversion_bruta, trainingMetrics, calculateSimulation, lastChangedVariable]);


    // Manejadores y Utilidades
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Actualizar la variable y marcar cuál cambió para propagación automática
        if (activeFactors.includes(name as FactorName)) {
            setLastChangedVariable(name as FactorName);
            setSimulationData(prev => ({
                ...prev,
                [name]: parseFloat(value)
            }));
        }
    };
    
    const handleResetToBase = () => {
        setLastChangedVariable(null);
        setSimulationData({
            ipc: LAST_DATA_POINT.ipc || 33.6, 
            desempleo: LAST_DATA_POINT.desempleo || 7.6, 
            inversion_bruta: LAST_DATA_POINT.inversion_bruta || 16.5, 
            pobreza: LAST_DATA_POINT.pobreza || 31.6,
        });
    };


    const getVarColor = (name: VariableName) => {
        switch (name) {
            case 'desempleo': return 'green';
            case 'ipc': return 'red';
            case 'inversion_bruta': return 'purple'; 
            case 'pobreza': return 'indigo';
            default: return 'gray';
        }
    };
    
    const varLabelMap: { [key in VariableName]: string } = {
        desempleo: 'Tasa de Desempleo (%)',
        ipc: 'Inflación Anual (IPC %)',
        inversion_bruta: 'Inversión Bruta / PIB (%)', 
        pobreza: 'Pobreza (%)'
    };
    
    const VariableControl: React.FC<{ name: FactorName }> = ({ name }) => {
        const color = getVarColor(name);
        const { min, max, step } = varRangeMap[name];
        
        const isValueOutOfRange = simulationData[name] < min || simulationData[name] > max;
        const isChanged = lastChangedVariable === name;
        const isAutoAdjusted = lastChangedVariable && lastChangedVariable !== name;

        return (
            <div className={`mb-4 p-4 rounded-lg border-2 
                ${isChanged ? 'border-blue-500 bg-blue-50' : isAutoAdjusted ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100'}`}>
                
                <div className="flex justify-between items-center mb-2">
                    <label className={`block text-${color}-700 font-bold`}>
                        {varLabelMap[name]}
                    </label>
                    
                    {/* Indicador de estado */}
                    <div className="text-xs font-semibold">
                        {isChanged ? (
                            <span className="text-blue-600">CAMBIADA</span>
                        ) : isAutoAdjusted ? (
                            <span className="text-indigo-600">AJUSTADA</span>
                        ) : (
                            <span className="text-gray-500">ESTABLE</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <input
                        type="range"
                        name={name}
                        min={min} 
                        max={max} 
                        step={step}
                        value={simulationData[name]}
                        onChange={handleInputChange}
                        className={`w-full h-2 bg-${color}-100 rounded-lg appearance-none cursor-pointer range-lg`}
                    />
                    <span className={`text-2xl font-extrabold w-20 
                        ${isValueOutOfRange ? 'text-red-500' : `text-${color}-600`}`
                    }>
                        {simulationData[name].toFixed(1)}%
                    </span>
                    {isChanged && (
                        <span className='ml-2 text-blue-600 font-bold text-xs'>
                            (VARIABLE CAMBIADA)
                        </span>
                    )}
                    {isAutoAdjusted && (
                        <span className='ml-2 text-indigo-600 font-bold text-xs'>
                            (AJUSTADA AUTOMÁTICAMENTE)
                        </span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
            <h1 className="text-3xl font-bold mb-2 text-center text-indigo-700">
                Pidea: Laboratorio de Pronósticos Probabilísticos
            </h1>
            <p className="text-center text-gray-600 mb-8">
                **Modo Actual:** <span className="font-extrabold text-lg text-blue-600">PROPAGACIÓN AUTOMÁTICA AVANZADA</span>
            </p>

            {/* PANEL BASE Y REINICIO */}
            <div className="mb-6 p-4 rounded-xl border-2 border-gray-300 bg-gray-100 transition-all duration-300">
                <div className="flex justify-between items-center">
                    <label className="block text-gray-700 font-bold text-lg">
                        PUNTO DE PARTIDA (2025-S1)
                    </label>
                     <button
                        onClick={handleResetToBase}
                        className="px-3 py-1 text-sm font-semibold rounded-full shadow-sm transition duration-150 ease-in-out bg-red-500 hover:bg-red-600 text-white"
                    >
                        REINICIAR A 2025
                    </button>
                </div>
                <p className='text-md mt-1 font-extrabold text-gray-600'>
                    Pobreza Base: {BASE_POVERTY.toFixed(2)}% | Desempleo: {LAST_DATA_POINT.desempleo}% | IPC: {LAST_DATA_POINT.ipc}% | IBIF: {LAST_DATA_POINT.inversion_bruta}%
                </p>
            </div>

            {/* GRÁFICO DE LÍNEAS */}
            <PovertyChart data={filledHistoricalData} simulationData={simulationData} metrics={trainingMetrics} />

            {/* Panel de Resultados y Coeficientes */}
            <div className="mt-6 p-6 bg-white rounded-xl shadow-lg border-2 border-indigo-200">
                <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
                    Resultado del Pronóstico
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {/* Tabla de Resultados Finales */}
                    <div className={`flex flex-col items-center p-3 rounded-lg border-2 border-indigo-300 bg-indigo-50`}>
                        <span className={`text-sm font-medium text-indigo-800`}>{'Pobreza'}</span>
                        <span className={`text-2xl font-extrabold text-indigo-800`}>
                            {simulationData.pobreza.toFixed(2)}%
                        </span>
                    </div>
                    {activeFactors.map(name => {
                        const color = getVarColor(name);
                        return (
                            <div key={name} className={`flex flex-col items-center p-3 rounded-lg border-2 border-${color}-300 bg-${color}-50`}>
                                <span className={`text-sm font-medium text-${color}-800`}>{varLabelMap[name].replace(/\s\(%\)/, '')}</span>
                                <span className={`text-2xl font-extrabold text-${color}-800`}>
                                    {simulationData[name].toFixed(2)}%
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="w-full mt-4 p-3 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700 text-center">
                        Coeficientes Avanzados - Algoritmos Estadísticos Integrados
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                            <h4 className="font-bold text-green-800 mb-1">Correlaciones Pearson</h4>
                            <div className="space-y-1">
                                <div>Desempleo: {trainingMetrics.correlations.desempleo.toFixed(2)}</div>
                                <div>IPC: {trainingMetrics.correlations.ipc.toFixed(2)}</div>
                                <div>IBIF: {trainingMetrics.correlations.inversion_bruta.toFixed(2)}</div>
                            </div>
                        </div>
                        <div className="text-center">
                            <h4 className="font-bold text-blue-800 mb-1">Correlaciones Parciales</h4>
                            <div className="space-y-1">
                                <div>IPC→Desempleo: {trainingMetrics.partialCorrelations.ipc?.desempleo?.toFixed(2) || 'N/A'}</div>
                                <div>Desempleo→IBIF: {trainingMetrics.partialCorrelations.desempleo?.inversion_bruta?.toFixed(2) || 'N/A'}</div>
                                <div>IPC→IBIF: {trainingMetrics.partialCorrelations.ipc?.inversion_bruta?.toFixed(2) || 'N/A'}</div>
                            </div>
                        </div>
                        <div className="text-center">
                            <h4 className="font-bold text-purple-800 mb-1">Coeficientes Ridge</h4>
                            <div className="space-y-1">
                                <div>IPC→Desempleo: {trainingMetrics.ridgeCoefficients.desempleo?.ipc?.toFixed(2) || 'N/A'}</div>
                                <div>Desempleo→IBIF: {trainingMetrics.ridgeCoefficients.inversion_bruta?.desempleo?.toFixed(2) || 'N/A'}</div>
                                <div>IPC→IBIF: {trainingMetrics.ridgeCoefficients.inversion_bruta?.ipc?.toFixed(2) || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500 text-center">
                        [Sistema integra: Pearson + Parcial + Ridge + VAR para propagación automática]
                    </div>
                </div>
            </div>
            
            {/* Controles de Simulación Automática */}
            <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border-2 border-green-200">
                <h2 className="text-2xl font-semibold text-green-700 mb-6">
                    Controles de Simulación Automática
                </h2>
                
                {/* Controles de Variables */}
                {activeFactors.map(name => (
                    // @ts-ignore
                    <VariableControl key={name} name={name} />
                ))}
                
                <div className="mt-6 p-4 border border-blue-300 bg-blue-50 rounded-lg">
                    <h3 className="text-xl font-bold text-blue-700 mb-3">
                        Sistema de Propagación Automática Avanzada
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">
                        <strong>Instrucciones:</strong> Simplemente mueva cualquier slider y observe cómo las otras dos variables se ajustan automáticamente usando algoritmos estadísticos avanzados (correlaciones parciales, regresión ridge y VAR).
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
                        <div className="text-center p-2 bg-white rounded">
                            <div className="font-bold text-blue-600">Correlación Parcial</div>
                            <div>Elimina efectos espurios</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                            <div className="font-bold text-purple-600">Regresión Ridge</div>
                            <div>Evita sobreajuste</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                            <div className="font-bold text-indigo-600">Modelo VAR</div>
                            <div>Captura dependencias temporales</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Laboratorio;
