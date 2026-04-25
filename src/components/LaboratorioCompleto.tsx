import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { HISTORICAL_DATA } from '../data/historicalData';
import { 
  generateCorrelationMatrix, 
  applyCascadePropagation, 
  validateAndClampValues,
  VARIABLE_LIMITS,
  calculatePoverty,
} from '../utils/correlationCalculator';
import { generateScenarioReport, formatReportAsText, ScenarioChange } from '../utils/reportGenerator';
import { validateCoherence, ValidationResult } from '../utils/coherenceValidator';
import {
  actualizarDatosHistoricosConMortalidadInfantilReal,
  clearMortalidadInfantilCache,
} from '../utils/actualizarDatosMortalidadInfantil';

// ----- Tipos ----------------------------------------------------------
const ADJUSTABLE_VARIABLES = [
  'ipc',
  'desempleo',
  'inversion_bruta',
  'consumo_energetico',
  'merval',
  'exportaciones',
  'riesgo_pais',
  'consumo_carne',
  'automoviles_vendidos',
  'deuda_publica',
  'pib',
  'salarios_reales',
  'inflacion_futura',
  'pobreza',
  'mortalidad_infantil',
] as const;
type AdjustableVariable = (typeof ADJUSTABLE_VARIABLES)[number];

type VariableDetails = Record<AdjustableVariable, {
  label: string;
  description: string;
  unit?: string;
  step: number;
  highlightClass: string;
  formatter?: (value: number) => string;
}>;

const VARIABLE_DETAILS: VariableDetails = {
  ipc: {
    label: 'Inflación (IPC %)',
    description: 'Índice de precios al consumidor interanual',
    unit: '%',
    step: 1,
    highlightClass: 'border-rose-400',
  },
  desempleo: {
    label: 'Tasa de desempleo',
    description: 'Porcentaje de la población económicamente activa',
    unit: '%',
    step: 0.1,
    highlightClass: 'border-emerald-400',
  },
  inversion_bruta: {
    label: 'Inversión Bruta Interna',
    description: 'Participación de la inversión sobre el PIB',
    unit: '%',
    step: 0.1,
    highlightClass: 'border-indigo-400',
  },
  consumo_energetico: {
    label: 'Consumo energético',
    description: 'kWh per cápita',
    unit: 'kWh',
    step: 10,
    highlightClass: 'border-amber-400',
  },
  merval: {
    label: 'Índice MERVAL',
    description: 'Índice bursátil representativo',
    step: 100,
    highlightClass: 'border-sky-400',
  },
  exportaciones: {
    label: 'Exportaciones',
    description: 'Participación sobre PIB',
    unit: '%',
    step: 0.1,
    highlightClass: 'border-cyan-400',
  },
  riesgo_pais: {
    label: 'Riesgo país',
    description: 'Puntos básicos EMBI',
    step: 50,
    highlightClass: 'border-fuchsia-400',
  },
  consumo_carne: {
    label: 'Consumo de carne',
    description: 'Kg por persona por año',
    step: 0.5,
    highlightClass: 'border-lime-400',
  },
  automoviles_vendidos: {
    label: 'Automóviles vendidos',
    description: 'Miles de unidades anuales',
    step: 10,
    highlightClass: 'border-orange-400',
  },
  deuda_publica: {
    label: 'Deuda pública',
    description: 'Porcentaje del PIB',
    unit: '%',
    step: 1,
    highlightClass: 'border-yellow-400',
  },
  pib: {
    label: 'PIB',
    description: 'Millones de USD corrientes',
    step: 5000,
    highlightClass: 'border-blue-400',
    formatter: value => `${Math.round(value / 1000)} B`,
  },
  salarios_reales: {
    label: 'Salarios reales',
    description: 'Índice base 100',
    step: 1,
    highlightClass: 'border-purple-400',
  },
  inflacion_futura: {
    label: 'Inflación futura esperada',
    description: 'Expectativa interanual',
    unit: '%',
    step: 1,
    highlightClass: 'border-pink-400',
  },
  pobreza: {
    label: 'Pobreza',
    description: 'Porcentaje de población bajo la línea de pobreza',
    unit: '%',
    step: 0.1,
    highlightClass: 'border-red-400',
  },
  mortalidad_infantil: {
    label: 'Mortalidad infantil',
    description: 'Muertes menores de 1 año por cada 1000 nacidos vivos',
    unit: 'por mil',
    step: 0.1,
    highlightClass: 'border-teal-400',
  },
};

const SUMMARY_VARIABLES: AdjustableVariable[] = [
  'ipc',
  'desempleo',
  'inversion_bruta',
  'pib',
  'riesgo_pais',
  'salarios_reales',
  'pobreza',
  'mortalidad_infantil',
];

const CHART_VARIABLES: AdjustableVariable[] = [...ADJUSTABLE_VARIABLES];

const LINE_COLOURS = [
  '#f97316',
  '#10b981',
  '#6366f1',
  '#fb7185',
  '#22d3ee',
  '#facc15',
  '#a855f7',
  '#14b8a6',
  '#ef4444',
  '#8b5cf6',
  '#0ea5e9',
  '#d946ef',
  '#4ade80',
  '#dc2626',
];

const formatDisplayValue = (variable: AdjustableVariable, value: number) => {
  const detail = VARIABLE_DETAILS[variable];
  if (detail.formatter) {
    return detail.formatter(value);
  }
  if (detail.unit === '%') {
    return `${value.toFixed(1)}%`;
  }
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString('es-AR', { maximumFractionDigits: 0 });
  }
  return value.toFixed(1);
};

const formatDeltaValue = (variable: AdjustableVariable, delta: number) => {
  const sign = delta > 0 ? '+' : '';
  const detail = VARIABLE_DETAILS[variable];
  if (detail.unit === '%') {
    return `${sign}${delta.toFixed(1)}%`;
  }
  const absolute = Math.abs(delta);
  if (absolute >= 1000) {
    return `${sign}${absolute.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
  }
  return `${sign}${delta.toFixed(2)}`;
};

const buildInitialState = (data: typeof HISTORICAL_DATA): Record<AdjustableVariable, number> => {
  const basePoint = data[data.length - 1];
  const initial: Partial<Record<AdjustableVariable, number>> = {};
  ADJUSTABLE_VARIABLES.forEach(variable => {
    initial[variable] = basePoint[variable];
  });
  return initial as Record<AdjustableVariable, number>;
};

const LOG_RANGE_THRESHOLD = 50;

const normalizeValue = (
  value: number,
  variable: AdjustableVariable,
  minMax: Record<AdjustableVariable, { min: number; max: number; useLog: boolean }>,
) => {
  const { min, max, useLog } = minMax[variable];
  const range = max - min;
  if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(range) || range === 0) {
    return 50;
  }
  const shifted = value - min;

  if (useLog) {
    const denom = Math.log1p(range);
    if (denom === 0) return 50;
    return 100 * (Math.log1p(Math.max(0, shifted)) / denom);
  }

  return 100 * (shifted / range);
};

const useHistoricalNormalization = (data: typeof HISTORICAL_DATA) => {
  return useMemo(() => {
    const normalization = {} as Record<AdjustableVariable, { min: number; max: number; useLog: boolean }>;
    ADJUSTABLE_VARIABLES.forEach(variable => {
      const values = data
        .map(point => point[variable])
        .filter((val): val is number => Number.isFinite(val));
      const min = values.length > 0 ? Math.min(...values) : 0;
      const max = values.length > 0 ? Math.max(...values) : 1;
      const useLog = max - min <= LOG_RANGE_THRESHOLD;
      normalization[variable] = { min, max, useLog };
    });
    return normalization;
  }, [data]);
};

const useLineChartData = (
  data: typeof HISTORICAL_DATA,
  normalization: ReturnType<typeof useHistoricalNormalization>,
) => {
  return useMemo(() => {
    const history = data.map(point => {
      const normalized: Partial<Record<AdjustableVariable, number>> = {};
      const rawValues: Record<string, number> = {};
      CHART_VARIABLES.forEach(variable => {
        const rawValue = Number.isFinite(point[variable]) ? point[variable] : 0;
        normalized[variable] = normalizeValue(rawValue, variable, normalization);
        rawValues[`${variable}_raw`] = rawValue;
      });
      return {
        anio: point.anio,
        ...normalized,
        ...rawValues,
      };
    });

    const lastYear = data[data.length - 1].anio;

    return { history, lastYear };
  }, [data, normalization]);
};

type CorrelationEntry = { variable: string; coefficient: number };

const LaboratorioCompleto: React.FC<{ onNavigate?: (version: 'simple' | 'intermedio' | 'completo') => void }> = ({
  onNavigate,
}) => {
  const [historicalData, setHistoricalData] = useState(HISTORICAL_DATA);
  const [hasUserInteraction, setHasUserInteraction] = useState(false);
  const [mortalidadStatus, setMortalidadStatus] = useState<{
    source: 'deis' | 'cache' | 'original';
    updatedAt: string | null;
  }>({ source: 'original', updatedAt: null });
  const [isRefreshingMortalidad, setIsRefreshingMortalidad] = useState(false);
  const [showMortalidadToast, setShowMortalidadToast] = useState(false);

  useEffect(() => {
    let isMounted = true;
    actualizarDatosHistoricosConMortalidadInfantilReal().then(result => {
      if (!isMounted) return;
      setHistoricalData(result.data);
      setMortalidadStatus({ source: result.source, updatedAt: result.updatedAt });
      if (result.source !== 'original') {
        setShowMortalidadToast(true);
        window.setTimeout(() => setShowMortalidadToast(false), 2200);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefreshMortalidad = async () => {
    if (isRefreshingMortalidad) return;
    setIsRefreshingMortalidad(true);
    clearMortalidadInfantilCache();
    const result = await actualizarDatosHistoricosConMortalidadInfantilReal({ forceRefresh: true });
    setHistoricalData(result.data);
    setMortalidadStatus({ source: result.source, updatedAt: result.updatedAt });
    setIsRefreshingMortalidad(false);
    setShowMortalidadToast(true);
    window.setTimeout(() => setShowMortalidadToast(false), 2200);
  };

  const correlationMatrix = useMemo(() => generateCorrelationMatrix(historicalData), [historicalData]);
  const normalization = useHistoricalNormalization(historicalData);
  const { history: chartHistory, lastYear } = useLineChartData(historicalData, normalization);

  const initialValues = useMemo(() => buildInitialState(historicalData), [historicalData]);

  const [stagedValues, setStagedValues] = useState<Record<AdjustableVariable, number>>(initialValues);
  const [appliedValues, setAppliedValues] = useState<Record<AdjustableVariable, number>>(initialValues);
  const [autoAdjusted, setAutoAdjusted] = useState<Set<AdjustableVariable>>(new Set());
  const [pendingVariables, setPendingVariables] = useState<Set<AdjustableVariable>>(new Set());
  const [lastAppliedVariable, setLastAppliedVariable] = useState<AdjustableVariable | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [lastDifferences, setLastDifferences] = useState<
    Partial<Record<AdjustableVariable, { delta: number; percent: number; mode: 'manual' | 'auto' }>>
  >({});
  const [scenarioReport, setScenarioReport] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [visibleVariables, setVisibleVariables] = useState<AdjustableVariable[]>([...SUMMARY_VARIABLES]);

  useEffect(() => {
    if (hasUserInteraction) return;
    setStagedValues(initialValues);
    setAppliedValues(initialValues);
  }, [hasUserInteraction, initialValues]);

  useEffect(() => {
    if (autoAdjusted.size === 0) return;
    const timeout = setTimeout(() => setAutoAdjusted(new Set()), 2000);
    return () => clearTimeout(timeout);
  }, [autoAdjusted]);

  const resolveShock = useCallback(
    (
      baseValues: Record<AdjustableVariable, number>,
      variable: AdjustableVariable,
      newValue: number,
    ): Record<AdjustableVariable, number> => {
      const cascaded = applyCascadePropagation(
        { ...baseValues },
        variable,
          newValue,
          correlationMatrix,
        4,
      );

      cascaded[variable] = newValue;

      const validated = validateAndClampValues(cascaded);
      const nextValues: Record<AdjustableVariable, number> = { ...baseValues };

      ADJUSTABLE_VARIABLES.forEach(name => {
        const candidate = validated[name];
        if (candidate !== undefined) {
          nextValues[name] = candidate;
        }
      });

      // Calcular pobreza automáticamente si no es la variable que se está cambiando
      if (variable !== 'pobreza') {
        nextValues.pobreza = calculatePoverty(nextValues);
      }

      return nextValues;
    },
    [correlationMatrix],
  );

  const handleSliderChange = (variable: AdjustableVariable, rawValue: number) => {
    if (!hasUserInteraction) {
      setHasUserInteraction(true);
    }
    setStagedValues(prev => ({ ...prev, [variable]: rawValue }));
    setPendingVariables(prev => {
      const next = new Set(prev);
      next.add(variable);
      return next;
    });
  };

  const handleApplyChanges = () => {
    if (pendingVariables.size === 0 || isApplying) return;
    setIsApplying(true);

    const order = Array.from(pendingVariables);
    let updated = { ...appliedValues };

    order.forEach(variable => {
      updated = resolveShock(updated, variable, stagedValues[variable]);
    });

    const autoAdjustments = new Set<AdjustableVariable>();
    const differences: Partial<Record<AdjustableVariable, { delta: number; percent: number; mode: 'manual' | 'auto' }>> = {};

    ADJUSTABLE_VARIABLES.forEach(variable => {
      const previous = appliedValues[variable];
      const current = updated[variable];
      const detail = VARIABLE_DETAILS[variable];
      const tolerance = Math.max(detail.step * 0.5, Math.abs(previous) * 0.002);
      const delta = current - previous;

      if (Math.abs(delta) > tolerance) {
        const mode = pendingVariables.has(variable) ? 'manual' : 'auto';
        if (mode === 'auto') {
          autoAdjustments.add(variable);
        }
        differences[variable] = {
          delta,
          percent: previous !== 0 ? (delta / previous) * 100 : 0,
          mode,
        };
      }
    });
    
    setAppliedValues(updated);
    setStagedValues(updated);
    setAutoAdjusted(autoAdjustments);
    setLastAppliedVariable(order[order.length - 1] ?? null);
    setPendingVariables(new Set());
    setLastDifferences(differences);
    
    // Generar informe automático
    const changes: ScenarioChange[] = Object.entries(differences).map(([variable, info]) => ({
      variable,
      previousValue: appliedValues[variable as AdjustableVariable],
      currentValue: updated[variable as AdjustableVariable],
      delta: info!.delta,
      percentChange: info!.percent,
      mode: info!.mode,
    }));
    
    if (changes.length > 0) {
      const report = generateScenarioReport(changes);
      const reportText = formatReportAsText(report);
      setScenarioReport(reportText);
      
      // Validar coherencia
      const validation = validateCoherence(updated, appliedValues);
      setValidationResult(validation);
    }
    
    setIsApplying(false);
  };

  const handleResetScenario = () => {
    setStagedValues(initialValues);
    setAppliedValues(initialValues);
    setAutoAdjusted(new Set());
    setPendingVariables(new Set());
    setLastAppliedVariable(null);
    setLastDifferences({});
  };

  const topCorrelations: CorrelationEntry[] = useMemo(() => {
    if (!lastAppliedVariable) return [];
    const correlations = correlationMatrix[lastAppliedVariable];
    if (!correlations) return [];

    return Object.entries(correlations)
      .filter(([variable]) => variable !== lastAppliedVariable && VARIABLE_DETAILS[variable as AdjustableVariable])
      .map(([variable, coefficient]) => ({ variable, coefficient }))
      .sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient))
      .slice(0, 6);
  }, [correlationMatrix, lastAppliedVariable]);

  const projectionYear = lastYear + 1;
  const chartData = useMemo(() => {
    const stagedPoint: Record<string, number> = { anio: projectionYear };
    CHART_VARIABLES.forEach(variable => {
      const rawValue = Number.isFinite(stagedValues[variable]) ? stagedValues[variable] : 0;
      stagedPoint[variable] = normalizeValue(rawValue, variable, normalization);
      stagedPoint[`${variable}_raw`] = rawValue;
    });
    return {
      history: chartHistory,
      stagedPoint,
    };
  }, [chartHistory, normalization, projectionYear, stagedValues]);

  const chartSeries = useMemo(() => {
    return [
      ...chartHistory,
      {
        anio: projectionYear,
        ...chartData.stagedPoint,
        isProjection: true,
      },
    ];
  }, [chartData.stagedPoint, chartHistory, projectionYear]);

  const toggleVariableVisibility = (variable: AdjustableVariable) => {
    setVisibleVariables(prev => {
      if (prev.includes(variable)) {
        return prev.filter(item => item !== variable);
      }
      return [...prev, variable];
    });
  };

  const diffEntries = useMemo(
    () =>
      (Object.entries(lastDifferences) as Array<
        [string, { delta: number; percent: number; mode: 'manual' | 'auto' } | undefined]
      >)
        .filter((entry): entry is [AdjustableVariable, { delta: number; percent: number; mode: 'manual' | 'auto' }] =>
          entry[1] !== undefined,
        )
        .sort((a, b) => Math.abs(b[1].delta) - Math.abs(a[1].delta)),
    [lastDifferences],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
      {onNavigate && (
          <div className="mb-6 flex justify-center gap-3">
          <button
            onClick={() => onNavigate('simple')}
              className="rounded-full bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-400"
          >
              Versión Simple
          </button>
          <button
            onClick={() => onNavigate('intermedio')}
              className="rounded-full bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-400"
          >
              Versión Intermedia
          </button>
          <button
            onClick={() => onNavigate('completo')}
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
              Versión Completa
          </button>
        </div>
      )}
      
        <header className="text-center">
          <h1 className="text-3xl font-bold text-indigo-700">Laboratorio Completo de Escenarios Económicos</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ajustá cualquier variable macroeconómica y aplicá el shock para ver cómo las demás se recalibran automáticamente
            según las correlaciones históricas del sistema.
          </p>
          {showMortalidadToast && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow">
              ✅ Datos actualizados
            </div>
          )}
          <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
              Mortalidad infantil: DEIS (Ministerio de Salud)
            </span>
            {mortalidadStatus.source === 'cache' && (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                Cache local activa
              </span>
            )}
            {mortalidadStatus.updatedAt && (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                Actualizado: {new Date(mortalidadStatus.updatedAt).toLocaleDateString('es-AR')}
              </span>
            )}
            <button
              type="button"
              onClick={handleRefreshMortalidad}
              disabled={isRefreshingMortalidad}
              className={`rounded-full px-3 py-1 font-semibold transition ${
                isRefreshingMortalidad
                  ? 'bg-slate-200 text-slate-500'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isRefreshingMortalidad ? 'Actualizando…' : 'Actualizar ahora'}
            </button>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {SUMMARY_VARIABLES.map(variable => (
            <div key={variable} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-500">
                {VARIABLE_DETAILS[variable].label}
              </h3>
              <div className="mt-2 text-3xl font-bold text-slate-900">
                {formatDisplayValue(variable, stagedValues[variable])}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {VARIABLE_DETAILS[variable].description}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Tendencias históricas normalizadas</h2>
              <p className="mt-1 text-xs text-slate-500">
                Compará trayectorias en escala 0-100. La línea vertical marca la proyección con los cambios actuales.
                Mortalidad infantil usa su propia escala a la derecha; valores reales en el tooltip.
                Variables de rango pequeño se visualizan con escala log suave para resaltar variaciones.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => setVisibleVariables([...SUMMARY_VARIABLES])}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 shadow-sm hover:border-slate-300"
              >
                Ver resumen
              </button>
              <button
                onClick={() => setVisibleVariables([...CHART_VARIABLES])}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 shadow-sm hover:border-slate-300"
              >
                Ver todas
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {CHART_VARIABLES.map((variable, index) => {
              const isActive = visibleVariables.includes(variable);
              return (
                <button
                  key={variable}
                  type="button"
                  onClick={() => toggleVariableVisibility(variable)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 shadow-sm transition ${
                    isActive
                      ? 'border-slate-800 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <span
                    className="inline-block h-2.5 w-6 rounded-full"
                    style={{ backgroundColor: LINE_COLOURS[index % LINE_COLOURS.length] }}
                  />
                  {VARIABLE_DETAILS[variable].label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartSeries} margin={{ top: 10, right: 18, left: 0, bottom: 10 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis
                  dataKey="anio"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={{ stroke: '#cbd5f5' }}
                  axisLine={{ stroke: '#94a3b8' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  yAxisId="normalized"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="mortalidad"
                  orientation="right"
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => value.toFixed(1)}
                />
                <Tooltip
                  formatter={(
                    value: number,
                    name: string,
                    payload: { payload?: Record<string, number> },
                  ) => {
                    const baseName = name.endsWith('_raw') ? name.replace(/_raw$/, '') : name;
                    const rawKey = name.endsWith('_raw') ? name : `${baseName}_raw`;
                    const rawValue = payload?.payload?.[rawKey];
                    const displayValue =
                      typeof rawValue === 'number'
                        ? formatDisplayValue(baseName as AdjustableVariable, rawValue)
                        : `${Number(value).toFixed(1)}`;
                    return [displayValue, VARIABLE_DETAILS[baseName as AdjustableVariable]?.label ?? baseName];
                  }}
                  labelFormatter={(label: number) => `Año ${label}`}
                  contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: '#64748b' }}
                  formatter={(value: string) => VARIABLE_DETAILS[value as AdjustableVariable]?.label ?? value}
                />
                <ReferenceLine
                  x={projectionYear}
                  yAxisId="normalized"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  label={{ value: `Proyección ${projectionYear}`, position: 'top', fill: '#94a3b8', fontSize: 10 }}
                />
                {CHART_VARIABLES.filter(variable => visibleVariables.includes(variable)).map((variable, index) => {
                  const isMortalidad = variable === 'mortalidad_infantil';
                  return (
                    <Line
                      key={variable}
                      type="monotone"
                      dataKey={isMortalidad ? `${variable}_raw` : variable}
                      name={variable}
                      yAxisId={isMortalidad ? 'mortalidad' : 'normalized'}
                      stroke={LINE_COLOURS[index % LINE_COLOURS.length]}
                      strokeWidth={2.6}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Controles de shock</h2>
              <p className="mt-1 text-xs text-slate-500">
                Ajustá los sliders que quieras y luego aplicá la propagación. Las variables con borde punteado muestran
                ajustes automáticos.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleResetScenario}
                className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                Restablecer escenario
              </button>
              <button
                onClick={handleApplyChanges}
                disabled={pendingVariables.size === 0 || isApplying}
                className={`${
                  pendingVariables.size === 0 || isApplying
                    ? 'bg-slate-300 text-slate-500'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                } rounded-full px-5 py-2 text-sm font-semibold transition`}
              >
                {isApplying ? 'Aplicando…' : pendingVariables.size === 0 ? 'Sin cambios pendientes' : 'Aplicar propagación'}
              </button>
            </div>
        </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {ADJUSTABLE_VARIABLES.map(variable => {
              const detail = VARIABLE_DETAILS[variable];
              const limits = VARIABLE_LIMITS[variable];
              const isPending = pendingVariables.has(variable);
              const isAuto = autoAdjusted.has(variable);
              const pendingDelta = stagedValues[variable] - appliedValues[variable];
              const pendingPercent =
                appliedValues[variable] !== 0 ? (pendingDelta / appliedValues[variable]) * 100 : 0;
              const lastDiff = lastDifferences[variable];

              const pendingColour = pendingDelta >= 0 ? 'text-emerald-600' : 'text-rose-600';
              const appliedColour = (lastDiff?.delta ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600';

              return (
                <div
                  key={variable}
                  className={`rounded-xl border bg-slate-50 p-4 transition-all ${
                    isPending
                      ? `${detail.highlightClass} ring-2 ring-offset-2 ring-indigo-200`
                      : isAuto
                      ? `${detail.highlightClass} border-dashed`
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-600">{detail.label}</h3>
                      <p className="text-xs text-slate-400">{detail.description}</p>
              </div>
                    <span className="text-lg font-bold text-slate-900">
                      {formatDisplayValue(variable, stagedValues[variable])}
                    </span>
              </div>

                  <input
                    type="range"
                    min={limits.min}
                    max={limits.max}
                    step={detail.step}
                    value={stagedValues[variable]}
                    onChange={event => handleSliderChange(variable, Number(event.target.value))}
                    className="mt-4 w-full cursor-pointer"
                  />

                  <div className="mt-2 flex justify-between text-xs text-slate-500">
                    <span>Mín: {formatDisplayValue(variable, limits.min)}</span>
                    <span>Máx: {formatDisplayValue(variable, limits.max)}</span>
              </div>

                  {isPending && Math.abs(pendingDelta) > 0.0001 && (
                    <div className={`mt-2 text-xs font-semibold ${pendingColour}`}>
                      Shock pendiente: {formatDeltaValue(variable, pendingDelta)} (
                      {`${pendingPercent >= 0 ? '+' : ''}${pendingPercent.toFixed(2)}%`})
                </div>
                  )}

                  {lastDiff && !isPending && (
                    <div className={`mt-2 text-xs font-semibold ${appliedColour}`}>
                      {lastDiff.mode === 'manual' ? 'Shock aplicado' : 'Pronóstico'}:{' '}
                      {formatDeltaValue(variable, lastDiff.delta)} (
                      {`${lastDiff.percent >= 0 ? '+' : ''}${lastDiff.percent.toFixed(2)}%`})
          </div>
        )}

                  {isAuto && !isPending && !lastDiff && (
                    <div className="mt-2 text-xs font-semibold text-indigo-600">
                      Ajustada automáticamente por correlación
          </div>
                  )}
          </div>
              );
            })}
          </div>
        </section>

        {diffEntries.length > 0 && (
          <section className="mt-10 rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-amber-700">Impacto del último escenario aplicado</h2>
            <p className="mt-1 text-xs text-slate-500">
              Diferencias entre el estado anterior y el actual. Las variaciones manuales se marcaron como «Shock» y las
              ajustadas automáticamente como «Propagación».
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Variable</th>
                    <th className="px-4 py-2 text-left">Valor actual</th>
                    <th className="px-4 py-2 text-left">Δ absoluto</th>
                    <th className="px-4 py-2 text-left">Δ %</th>
                    <th className="px-4 py-2 text-left">Origen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {diffEntries.map(([variable, info]) => (
                    <tr key={variable}>
                      <td className="px-4 py-2 font-medium text-slate-700">
                        {VARIABLE_DETAILS[variable]?.label || variable}
                      </td>
                      <td className="px-4 py-2 text-slate-700">
                        {formatDisplayValue(variable, appliedValues[variable])}
                      </td>
                      <td className="px-4 py-2 text-slate-700">
                        {formatDeltaValue(variable, info.delta)}
                      </td>
                      <td className="px-4 py-2 text-slate-700">
                        {`${info.percent >= 0 ? '+' : ''}${info.percent.toFixed(2)}%`}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            info.mode === 'manual'
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {info.mode === 'manual' ? 'Shock' : 'Propagación'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                      </div>
          </section>
        )}

        {scenarioReport && validationResult && (
          <section className="mt-10 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-blue-700">Informe Automático y Validación</h2>
              <button
                onClick={() => setShowReport(!showReport)}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                {showReport ? 'Ocultar' : 'Ver Informe'}
              </button>
            </div>
            
            {/* Score de validación */}
            <div className="mb-4 p-4 rounded-lg bg-slate-50">
              <div className="flex items-center gap-3">
                <div className={`text-2xl font-bold ${
                  validationResult.score >= 80 ? 'text-green-600' : 
                  validationResult.score >= 60 ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>
                  {validationResult.score}/100
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">
                    Puntuación de Coherencia
                  </div>
                  <div className="text-xs text-slate-500">
                    {validationResult.isValid ? '✅ Escenario coherente' : '❌ Requiere revisión'}
                  </div>
                </div>
              </div>
            </div>

            {showReport && (
              <div className="space-y-4">
                {/* Validación */}
                {validationResult.errors.length > 0 && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <h3 className="text-sm font-semibold text-red-700 mb-2">Errores Críticos</h3>
                    <ul className="text-xs text-red-600 space-y-1">
                      {validationResult.errors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationResult.warnings.length > 0 && (
                  <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                    <h3 className="text-sm font-semibold text-yellow-700 mb-2">Advertencias</h3>
                    <ul className="text-xs text-yellow-600 space-y-1">
                      {validationResult.warnings.map((warning, idx) => (
                        <li key={idx}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Informe */}
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Informe Detallado</h3>
                  <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono overflow-x-auto">
                    {scenarioReport}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(scenarioReport);
                      alert('Informe copiado al portapapeles');
                    }}
                    className="mt-3 text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    📋 Copiar informe al portapapeles
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {lastAppliedVariable && topCorrelations.length > 0 && (
          <section className="mt-10 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-indigo-700">
              Relaciones destacadas al shock de «{VARIABLE_DETAILS[lastAppliedVariable].label}»
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Coeficientes de sensibilidad que se utilizaron para propagar el último cambio aplicado.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {topCorrelations.map(({ variable, coefficient }) => {
                const detail = VARIABLE_DETAILS[variable as AdjustableVariable];
                return (
                  <div key={variable} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="text-sm font-semibold text-slate-700">
                      {detail?.label || variable}
                </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Coeficiente: {coefficient.toFixed(2)}
              </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {coefficient > 0 ? 'Relación directa' : 'Relación inversa'}
          </div>
        </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Cómo leer los resultados</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>
              • Ajustá los sliders que quieras y presioná «Aplicar propagación». El sistema respeta las correlaciones históricas
              para recalibrar todas las variables relacionadas.
            </p>
            <p>
              • Las variables con borde pleno son las que modificaste manualmente. Las de borde punteado indican ajustes
              automáticos derivados del shock.
            </p>
            <p>
              • En el gráfico podés activar o desactivar variables para enfocarte en las series que te interesen.
            </p>
            <p>
              • El gráfico superior mantiene la visualización clásica de IPC, desempleo e inversión bruta, proyectando el
              impacto del escenario aplicado un año hacia adelante.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LaboratorioCompleto;
