// Validador de coherencia de resultados económicos

import { VARIABLE_LIMITS } from './correlationCalculator';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100, donde 100 es completamente coherente
}

export interface VariableValues {
  [key: string]: number;
}

/**
 * Valida la coherencia de un conjunto de valores económicos
 */
export function validateCoherence(
  values: VariableValues,
  previousValues?: VariableValues
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Validación 1: Valores dentro de límites realistas
  const limitErrors = validateLimits(values);
  errors.push(...limitErrors.errors);
  warnings.push(...limitErrors.warnings);
  score -= limitErrors.errors.length * 10;
  score -= limitErrors.warnings.length * 5;

  // Validación 2: Relaciones económicas básicas
  const relationErrors = validateEconomicRelations(values);
  errors.push(...relationErrors.errors);
  warnings.push(...relationErrors.warnings);
  score -= relationErrors.errors.length * 15;
  score -= relationErrors.warnings.length * 5;

  // Validación 3: Consistencia con cambios previos
  if (previousValues) {
    const consistencyErrors = validateConsistency(values, previousValues);
    errors.push(...consistencyErrors.errors);
    warnings.push(...consistencyErrors.warnings);
    score -= consistencyErrors.errors.length * 10;
    score -= consistencyErrors.warnings.length * 3;
  }

  // Validación 4: Escenarios extremos
  const extremeWarnings = validateExtremeScenarios(values);
  warnings.push(...extremeWarnings);
  score -= extremeWarnings.length * 5;

  score = Math.max(0, Math.min(100, score));

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score,
  };
}

function validateLimits(values: VariableValues): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  Object.keys(values).forEach(variable => {
    const value = values[variable];
    const limits = VARIABLE_LIMITS[variable];

    if (!limits) return;

    if (value < limits.min) {
      errors.push(
        `❌ ${variable}: valor ${value.toFixed(2)} está por debajo del mínimo histórico ` +
        `(${limits.min}). Esto es económicamente inviable.`
      );
    } else if (value > limits.max) {
      errors.push(
        `❌ ${variable}: valor ${value.toFixed(2)} excede el máximo histórico ` +
        `(${limits.max}). Esto es económicamente inviable.`
      );
    } else if (value < limits.min * 1.1 || value > limits.max * 0.9) {
      warnings.push(
        `⚠️ ${variable}: valor ${value.toFixed(2)} está cerca de los límites históricos ` +
        `(${limits.min}-${limits.max}).`
      );
    }
  });

  return { errors, warnings };
}

function validateEconomicRelations(values: VariableValues): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Relación 1: IPC y salarios reales (inversa)
  if (values.ipc && values.salarios_reales) {
    const expectedSalarios = 100 - (values.ipc - 33.6) * 0.5; // Relación aproximada
    const deviation = Math.abs(values.salarios_reales - expectedSalarios);
    
    if (deviation > 30) {
      warnings.push(
        `⚠️ Relación IPC-Salarios: Los salarios reales (${values.salarios_reales.toFixed(1)}) ` +
        `parecen inconsistentes con el IPC (${values.ipc.toFixed(1)}%). ` +
        `Se esperaría aproximadamente ${expectedSalarios.toFixed(1)}.`
      );
    }
  }

  // Relación 2: Desempleo y pobreza (directa)
  if (values.desempleo && values.pobreza) {
    const expectedPobreza = 20 + (values.desempleo - 7.6) * 2; // Relación aproximada
    const deviation = Math.abs(values.pobreza - expectedPobreza);
    
    if (deviation > 15) {
      warnings.push(
        `⚠️ Relación Desempleo-Pobreza: La pobreza (${values.pobreza.toFixed(1)}%) ` +
        `parece inconsistente con el desempleo (${values.desempleo.toFixed(1)}%). ` +
        `Se esperaría aproximadamente ${expectedPobreza.toFixed(1)}%.`
      );
    }
  }

  // Relación 3: PIB y consumo energético (directa)
  if (values.pib && values.consumo_energetico) {
    const pibNormalized = values.pib / 100000; // Normalizar a escala similar
    const consumoNormalized = values.consumo_energetico / 100;
    const ratio = pibNormalized / consumoNormalized;
    
    if (ratio < 0.5 || ratio > 2.0) {
      warnings.push(
        `⚠️ Relación PIB-Consumo Energético: La proporción parece inusual. ` +
        `Esto podría indicar cambios estructurales en la economía.`
      );
    }
  }

  // Relación 4: Riesgo país e inversión (inversa)
  if (values.riesgo_pais && values.inversion_bruta) {
    if (values.riesgo_pais > 2000 && values.inversion_bruta > 20) {
      warnings.push(
        `⚠️ Relación Riesgo País-Inversión: Alto riesgo país (${values.riesgo_pais}) ` +
        `con alta inversión (${values.inversion_bruta.toFixed(1)}%) es inusual. ` +
        `Normalmente el riesgo alto desincentiva la inversión.`
      );
    }
  }

  // Relación 5: IPC e inflación futura (directa)
  if (values.ipc && values.inflacion_futura) {
    const deviation = Math.abs(values.inflacion_futura - values.ipc);
    
    if (deviation > 50) {
      warnings.push(
        `⚠️ Relación IPC-Inflación Futura: Gran diferencia entre IPC actual ` +
        `(${values.ipc.toFixed(1)}%) e inflación futura esperada ` +
        `(${values.inflacion_futura.toFixed(1)}%). Esto sugiere expectativas ` +
        `de cambio significativo.`
      );
    }
  }

  return { errors, warnings };
}

function validateConsistency(
  currentValues: VariableValues,
  previousValues: VariableValues
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  Object.keys(currentValues).forEach(variable => {
    const current = currentValues[variable];
    const previous = previousValues[variable];

    if (previous === undefined) return;

    const change = current - previous;
    const percentChange = previous !== 0 ? (change / previous) * 100 : 0;
    const absPercentChange = Math.abs(percentChange);

    // Cambios extremos (>50%) requieren validación
    if (absPercentChange > 50) {
      warnings.push(
        `⚠️ Cambio extremo en ${variable}: ${percentChange.toFixed(1)}% ` +
        `(${previous.toFixed(2)} → ${current.toFixed(2)}). ` +
        `Este nivel de cambio en un período corto es inusual.`
      );
    }

    // Cambios muy grandes pero posibles (>30%)
    if (absPercentChange > 30 && absPercentChange <= 50) {
      warnings.push(
        `ℹ️ Cambio significativo en ${variable}: ${percentChange.toFixed(1)}%. ` +
        `Asegúrese de que este cambio sea intencional.`
      );
    }
  });

  return { errors, warnings };
}

function validateExtremeScenarios(values: VariableValues): string[] {
  const warnings: string[] = [];

  // Escenario de hiperinflación
  if (values.ipc > 100) {
    warnings.push(
      `🚨 Escenario de hiperinflación detectado (IPC: ${values.ipc.toFixed(1)}%). ` +
      `Este escenario requiere políticas monetarias y fiscales extremas.`
    );
  }

  // Escenario de depresión económica
  if (values.desempleo > 20 && values.pib && values.pib < 250000) {
    warnings.push(
      `🚨 Escenario de depresión económica: Desempleo alto (${values.desempleo.toFixed(1)}%) ` +
      `y PIB bajo (${(values.pib / 1000).toFixed(0)}B). Requiere intervención estatal significativa.`
    );
  }

  // Escenario de crisis de deuda
  if (values.deuda_publica > 120 && values.riesgo_pais > 3000) {
    warnings.push(
      `🚨 Escenario de crisis de deuda: Deuda pública alta (${values.deuda_publica.toFixed(1)}%) ` +
      `y riesgo país elevado (${values.riesgo_pais}). Riesgo de default.`
    );
  }

  // Escenario de estanflación
  if (values.ipc > 30 && values.desempleo > 10) {
    warnings.push(
      `🚨 Escenario de estanflación: Alta inflación (${values.ipc.toFixed(1)}%) ` +
      `y alto desempleo (${values.desempleo.toFixed(1)}%). Situación económica crítica.`
    );
  }

  // Escenario de pobreza extrema
  if (values.pobreza > 50) {
    warnings.push(
      `🚨 Pobreza extrema: ${values.pobreza.toFixed(1)}% de la población bajo la línea de pobreza. ` +
      `Requiere políticas sociales urgentes.`
    );
  }

  return warnings;
}

/**
 * Genera un resumen de validación legible
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];
  
  lines.push('='.repeat(60));
  lines.push('VALIDACIÓN DE COHERENCIA ECONÓMICA');
  lines.push('='.repeat(60));
  lines.push('');
  
  // Score
  const scoreColor = result.score >= 80 ? '✅' : result.score >= 60 ? '⚠️' : '❌';
  lines.push(`${scoreColor} Puntuación de Coherencia: ${result.score}/100`);
  lines.push('');
  
  // Estado general
  if (result.isValid) {
    lines.push('✅ El escenario es económicamente coherente.');
  } else {
    lines.push('❌ El escenario presenta inconsistencias que requieren atención.');
  }
  lines.push('');
  
  // Errores
  if (result.errors.length > 0) {
    lines.push('ERRORES CRÍTICOS:');
    lines.push('-'.repeat(60));
    result.errors.forEach(error => {
      lines.push(error);
    });
    lines.push('');
  }
  
  // Advertencias
  if (result.warnings.length > 0) {
    lines.push('ADVERTENCIAS:');
    lines.push('-'.repeat(60));
    result.warnings.forEach(warning => {
      lines.push(warning);
    });
    lines.push('');
  }
  
  if (result.errors.length === 0 && result.warnings.length === 0) {
    lines.push('✅ No se detectaron problemas de coherencia.');
    lines.push('');
  }
  
  lines.push('='.repeat(60));
  
  return lines.join('\n');
}

