// Generador automático de informes escritos sobre los cambios económicos

// Mapeo de variables a labels (debe mantenerse sincronizado con VARIABLE_DETAILS)
const VARIABLE_LABELS: Record<string, string> = {
  ipc: 'Inflación (IPC %)',
  desempleo: 'Tasa de desempleo',
  inversion_bruta: 'Inversión Bruta Interna',
  consumo_energetico: 'Consumo energético',
  merval: 'Índice MERVAL',
  exportaciones: 'Exportaciones',
  riesgo_pais: 'Riesgo país',
  consumo_carne: 'Consumo de carne',
  automoviles_vendidos: 'Automóviles vendidos',
  deuda_publica: 'Deuda pública',
  pib: 'PIB',
  salarios_reales: 'Salarios reales',
  inflacion_futura: 'Inflación futura esperada',
  pobreza: 'Pobreza',
  mortalidad_infantil: 'Mortalidad infantil',
};

export interface ScenarioChange {
  variable: string;
  previousValue: number;
  currentValue: number;
  delta: number;
  percentChange: number;
  mode: 'manual' | 'auto';
}

export interface ScenarioReport {
  title: string;
  summary: string;
  changes: ScenarioChange[];
  analysis: string;
  implications: string[];
  warnings: string[];
  timestamp: Date;
}

/**
 * Genera un informe escrito automático basado en los cambios aplicados
 */
export function generateScenarioReport(
  changes: ScenarioChange[]
): ScenarioReport {
  const manualChanges = changes.filter(c => c.mode === 'manual');
  const autoChanges = changes.filter(c => c.mode === 'auto');
  
  // Título del informe
  const title = manualChanges.length > 0
    ? `Análisis de Escenario: ${manualChanges.map(c => getVariableLabel(c.variable)).join(' y ')}`
    : 'Análisis de Escenario Económico';

  // Resumen ejecutivo
  const summary = generateSummary(manualChanges, autoChanges);

  // Análisis detallado
  const analysis = generateDetailedAnalysis(changes, manualChanges, autoChanges);

  // Implicaciones
  const implications = generateImplications(changes);

  // Advertencias
  const warnings = generateWarnings(changes);

  return {
    title,
    summary,
    changes,
    analysis,
    implications,
    warnings,
    timestamp: new Date(),
  };
}

function getVariableLabel(variable: string): string {
  return VARIABLE_LABELS[variable] || variable;
}

function generateSummary(manualChanges: ScenarioChange[], autoChanges: ScenarioChange[]): string {
  if (manualChanges.length === 0) {
    return 'No se han aplicado cambios manuales al escenario económico.';
  }

  const mainChange = manualChanges[0];
  const mainLabel = getVariableLabel(mainChange.variable);
  const direction = mainChange.delta > 0 ? 'aumento' : 'disminución';
  const magnitude = Math.abs(mainChange.percentChange);

  let summary = `Se aplicó un ${direction} del ${magnitude.toFixed(1)}% en ${mainLabel}`;
  
  if (manualChanges.length > 1) {
    summary += `, junto con cambios en ${manualChanges.length - 1} variable${manualChanges.length > 2 ? 's' : ''} adicional${manualChanges.length > 2 ? 'es' : ''}`;
  }

  if (autoChanges.length > 0) {
    summary += `. Como resultado, ${autoChanges.length} variable${autoChanges.length > 1 ? 's' : ''} se ajustó${autoChanges.length > 1 ? 'ron' : ''} automáticamente mediante correlaciones históricas.`;
  } else {
    summary += '.';
  }

  return summary;
}

function generateDetailedAnalysis(
  allChanges: ScenarioChange[],
  manualChanges: ScenarioChange[],
  autoChanges: ScenarioChange[]
): string {
  const paragraphs: string[] = [];

  // Análisis de cambios manuales
  if (manualChanges.length > 0) {
    paragraphs.push('## Cambios Aplicados Manualmente\n\n');
    
    manualChanges.forEach(change => {
      const label = getVariableLabel(change.variable);
      const direction = change.delta > 0 ? 'aumentó' : 'disminuyó';
      const absDelta = Math.abs(change.delta);
      const absPercent = Math.abs(change.percentChange);
      
      paragraphs.push(
        `**${label}**: ${direction} de ${absDelta.toFixed(2)} unidades ` +
        `(${absPercent.toFixed(1)}%), pasando de ${change.previousValue.toFixed(2)} ` +
        `a ${change.currentValue.toFixed(2)}.`
      );
    });
  }

  // Análisis de propagación automática
  if (autoChanges.length > 0) {
    paragraphs.push('\n## Efectos Propagados\n\n');
    paragraphs.push(
      `Las siguientes ${autoChanges.length} variable${autoChanges.length > 1 ? 's' : ''} ` +
      `se ajustaron automáticamente debido a las correlaciones históricas detectadas:\n\n`
    );

    // Ordenar por magnitud de cambio
    const sortedAuto = [...autoChanges].sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange));
    
    sortedAuto.slice(0, 5).forEach(change => {
      const label = getVariableLabel(change.variable);
      const direction = change.delta > 0 ? 'aumentó' : 'disminuyó';
      const absPercent = Math.abs(change.percentChange);
      
      paragraphs.push(
        `- **${label}**: ${direction} un ${absPercent.toFixed(1)}% ` +
        `(${change.previousValue.toFixed(2)} → ${change.currentValue.toFixed(2)})`
      );
    });

    if (sortedAuto.length > 5) {
      paragraphs.push(`\n*Y ${sortedAuto.length - 5} variable${sortedAuto.length > 6 ? 's' : ''} adicional${sortedAuto.length > 6 ? 'es' : ''}.*`);
    }
  }

  // Análisis de impacto en pobreza
  const pobrezaChange = allChanges.find(c => c.variable === 'pobreza');
  if (pobrezaChange) {
    paragraphs.push('\n## Impacto en Pobreza\n\n');
    const direction = pobrezaChange.delta > 0 ? 'aumento' : 'reducción';
    const absPercent = Math.abs(pobrezaChange.percentChange);
    
    paragraphs.push(
      `La pobreza experimentó un ${direction} del ${absPercent.toFixed(1)}%, ` +
      `pasando de ${pobrezaChange.previousValue.toFixed(1)}% a ${pobrezaChange.currentValue.toFixed(1)}%. ` +
      `Este cambio refleja el impacto combinado de las modificaciones en las variables económicas fundamentales.`
    );
  }

  return paragraphs.join('\n');
}

function generateImplications(changes: ScenarioChange[]): string[] {
  const implications: string[] = [];

  // Implicaciones basadas en cambios significativos
  const significantChanges = changes.filter(c => Math.abs(c.percentChange) > 5);
  
  significantChanges.forEach(change => {
    const label = getVariableLabel(change.variable);
    
    if (change.variable === 'ipc' && change.delta > 0) {
      implications.push(
        `El aumento en ${label} podría generar presión sobre el poder adquisitivo ` +
        `y afectar negativamente el consumo interno.`
      );
    }
    
    if (change.variable === 'desempleo' && change.delta > 0) {
      implications.push(
        `El incremento en ${label} sugiere una desaceleración en la actividad económica ` +
        `y potencial aumento en la demanda de políticas de empleo.`
      );
    }
    
    if (change.variable === 'inversion_bruta' && change.delta > 0) {
      implications.push(
        `El aumento en ${label} indica una mejora en las perspectivas de crecimiento ` +
        `económico a mediano plazo.`
      );
    }
    
    if (change.variable === 'riesgo_pais' && change.delta > 0) {
      implications.push(
        `El incremento en ${label} refleja mayor percepción de riesgo, lo que podría ` +
        `afectar el acceso al financiamiento y la inversión extranjera.`
      );
    }
    
    if (change.variable === 'pobreza' && change.delta > 0) {
      implications.push(
        `El aumento en ${label} requiere atención inmediata en políticas sociales ` +
        `y de redistribución del ingreso.`
      );
    }
  });

  // Implicaciones generales
  const totalVariablesChanged = changes.length;
  if (totalVariablesChanged > 5) {
    implications.push(
      `El escenario muestra cambios simultáneos en múltiples variables, ` +
      `indicando un shock económico de amplio alcance que requiere análisis multidimensional.`
    );
  }

  return implications.length > 0 ? implications : [
    'Los cambios aplicados son de magnitud moderada y se encuentran dentro de rangos históricos observados.'
  ];
}

function generateWarnings(changes: ScenarioChange[]): string[] {
  const warnings: string[] = [];

  // Advertencias por valores extremos
  changes.forEach(change => {
    const absPercent = Math.abs(change.percentChange);
    
    if (absPercent > 20) {
      warnings.push(
        `⚠️ Cambio extremo detectado en ${getVariableLabel(change.variable)}: ` +
        `${change.percentChange.toFixed(1)}%. Este nivel de variación es inusual y requiere validación adicional.`
      );
    }
  });

  // Advertencias por combinaciones problemáticas
  const ipcChange = changes.find(c => c.variable === 'ipc');
  const desempleoChange = changes.find(c => c.variable === 'desempleo');
  
  if (ipcChange && desempleoChange && ipcChange.delta > 0 && desempleoChange.delta > 0) {
    warnings.push(
      `⚠️ Combinación crítica: aumento simultáneo de inflación y desempleo ` +
      `(estanflación). Esta situación requiere políticas económicas coordinadas.`
    );
  }

  const riesgoChange = changes.find(c => c.variable === 'riesgo_pais');
  const inversionChange = changes.find(c => c.variable === 'inversion_bruta');
  
  if (riesgoChange && inversionChange && riesgoChange.delta > 0 && inversionChange.delta < 0) {
    warnings.push(
      `⚠️ Aumento en riesgo país junto con disminución en inversión sugiere ` +
      `deterioro en el clima de inversión.`
    );
  }

  return warnings;
}

/**
 * Formatea el informe como texto plano para mostrar o exportar
 */
export function formatReportAsText(report: ScenarioReport): string {
  const lines: string[] = [];
  
  lines.push('='.repeat(60));
  lines.push(report.title.toUpperCase());
  lines.push('='.repeat(60));
  lines.push(`Fecha: ${report.timestamp.toLocaleString('es-AR')}`);
  lines.push('');
  
  lines.push('RESUMEN EJECUTIVO');
  lines.push('-'.repeat(60));
  lines.push(report.summary);
  lines.push('');
  
  lines.push('ANÁLISIS DETALLADO');
  lines.push('-'.repeat(60));
  lines.push(report.analysis);
  lines.push('');
  
  if (report.implications.length > 0) {
    lines.push('IMPLICACIONES');
    lines.push('-'.repeat(60));
    report.implications.forEach(imp => {
      lines.push(`• ${imp}`);
    });
    lines.push('');
  }
  
  if (report.warnings.length > 0) {
    lines.push('ADVERTENCIAS');
    lines.push('-'.repeat(60));
    report.warnings.forEach(warn => {
      lines.push(warn);
    });
    lines.push('');
  }
  
  lines.push('='.repeat(60));
  
  return lines.join('\n');
}

