// Calculador de Complejidad Emergente del Sistema
// La complejidad emerge de las interacciones entre múltiples variables económicas

export interface SystemComplexity {
  stability: number;        // Estabilidad del sistema (0-100)
  interconnectedness: number; // Nivel de interconexión entre variables
  volatility: number;       // Volatilidad del sistema
  emergingState: string;   // Descripción del estado emergente
  affectedVariables: number; // Cantidad de variables que se modificaron
  cascadeDepth: number;    // Profundidad de la cascada de efectos
}

/**
 * Calcula la complejidad emergente del sistema basada en las interacciones entre variables
 * Esta complejidad es una propiedad emergente que surge de las múltiples interacciones,
 * no se puede calcular directamente, sino que emerge de las relaciones
 */
export function calculateSystemComplexity(
  baseValues: {[key: string]: number},
  currentValues: {[key: string]: number},
  propagatedVariables: Set<string>
): SystemComplexity {
  // Calcular cambios en todas las variables
  const changes: {[key: string]: number} = {};
  let totalChange = 0;
  let maxChange = 0;
  
  Object.keys(currentValues).forEach(key => {
    const change = Math.abs(currentValues[key] - baseValues[key]);
    changes[key] = change;
    totalChange += change;
    maxChange = Math.max(maxChange, change);
  });
  
  // Estabilidad: inversa de la variación total
  // Si muchas variables cambiaron mucho, el sistema es menos estable
  const avgChange = totalChange / Object.keys(changes).length;
  const stability = Math.max(0, Math.min(100, 100 - (avgChange * 10)));
  
  // Interconexión: cuántas variables se vieron afectadas por propagación
  const interconnectedness = (propagatedVariables.size / Object.keys(changes).length) * 100;
  
  // Volatilidad: variación de los cambios
  const variance = Object.values(changes).reduce((sum, change) => {
    return sum + Math.pow(change - avgChange, 2);
  }, 0) / Object.keys(changes).length;
  const volatility = Math.min(100, variance * 100);
  
  // Estado emergente basado en las características del sistema
  let emergingState = 'Estable';
  if (stability < 40) {
    emergingState = 'Crítico';
  } else if (stability < 60) {
    emergingState = 'Inestable';
  } else if (stability < 80) {
    emergingState = 'En Transición';
  } else if (stability >= 80) {
    emergingState = 'Estable';
  }
  
  // Profundidad de cascada: cuántas variables se afectaron indirectamente
  const cascadeDepth = propagatedVariables.size;
  
  return {
    stability,
    interconnectedness,
    volatility,
    emergingState,
    affectedVariables: Object.keys(changes).filter(k => Math.abs(changes[k]) > 0.01).length,
    cascadeDepth
  };
}

/**
 * Genera una descripción del estado complejo emergente del sistema
 */
export function describeEmergingComplexity(complexity: SystemComplexity): string {
  const parts: string[] = [];
  
  parts.push(`El sistema muestra un estado ${complexity.emergingState.toLowerCase()}`);
  parts.push(`con ${complexity.affectedVariables} variables en interacción`);
  parts.push(`y una cascada de efectos de profundidad ${complexity.cascadeDepth}`);
  
  if (complexity.interconnectedness > 70) {
    parts.push(`La alta interconexión (${complexity.interconnectedness.toFixed(0)}%) indica que`);
    parts.push(`los cambios se propagan ampliamente a través del sistema.`);
  }
  
  if (complexity.volatility > 50) {
    parts.push(`La volatilidad elevada sugiere un sistema en rápida transformación.`);
  }
  
  return parts.join('. ') + '.';
}

/**
 * Calcula métricas de complejidad para visualización
 */
export function getComplexityMetrics(complexity: SystemComplexity) {
  return {
    stabilityColor: complexity.stability > 70 ? 'green' : complexity.stability > 40 ? 'yellow' : 'red',
    interconnectednessLevel: complexity.interconnectedness > 50 ? 'Alta' : 'Media',
    volatilityLevel: complexity.volatility > 50 ? 'Alta' : complexity.volatility > 25 ? 'Media' : 'Baja',
  };
}

