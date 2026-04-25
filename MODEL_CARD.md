# Model Card - Polia v1

## 1) Propósito del modelo

El modelo de `Polia` busca estimar consecuencias probables de propuestas de política pública usando datos históricos y reglas de propagación entre variables macro/sociales.

Este modelo:
- ayuda a estructurar debate público con evidencia;
- no reemplaza decisiones humanas, legales o democráticas;
- no debe usarse como autoridad única.

## 2) Alcance (qué hace y qué no hace)

### Qué hace
- simula escenarios tipo "qué pasaría si";
- proyecta impactos relativos en variables seleccionadas;
- devuelve explicación resumida del resultado;
- muestra nivel de confianza e incertidumbre cuando está disponible.

### Qué no hace
- no predice el futuro con certeza;
- no capta por completo shocks externos (guerras, crisis globales, desastres);
- no reemplaza evaluación jurídica, ética ni presupuestaria integral;
- no determina por sí solo la "mejor política".

## 3) Variables principales (v1)

Ejemplos actuales en la app:
- inflación;
- desempleo;
- inversión;
- exportaciones;
- riesgo país;
- pobreza (derivada);
- salario real;
- PIB.

La lista puede evolucionar y toda modificación debe quedar versionada en changelog.

## 4) Fuentes de datos

Fuentes priorizadas (según disponibilidad):
- INDEC;
- BCRA;
- series públicas internacionales (ej. FRED);
- datasets manuales con trazabilidad documentada.

Toda fuente debe estar referenciada en `DATA_SOURCES.md`.

## 5) Método de modelado (v1)

En v1 se combina:
- series históricas;
- correlaciones y reglas de propagación;
- validaciones de coherencia económica básica;
- generación de explicación textual del escenario.

No se usa inferencia causal robusta en esta versión. Las salidas deben interpretarse como orientación probabilística preliminar.

## 6) Riesgos y sesgos conocidos

- sesgo de cobertura por datos incompletos o desactualizados;
- sesgo de diseño en reglas de propagación;
- falsa precisión por redondeos o simplificaciones;
- mal uso político del resultado fuera de contexto.

## 7) Mitigaciones actuales

- mostrar fuentes y fecha de actualización;
- explicitar supuestos de cada simulación;
- exponer limitaciones del resultado;
- mantener historial de cambios del modelo;
- permitir auditoría pública del código.

## 8) Métricas mínimas de calidad (a implementar/seguir)

- porcentaje de variables con fuente y fecha visibles;
- tasa de simulaciones con validación de coherencia;
- error retrospectivo por backtesting (cuando aplique);
- tiempo desde actualización de datos.

## 9) Gobernanza del modelo

Cambios de modelo relevantes deben incluir:
1. motivo del cambio;
2. impacto esperado;
3. riesgos;
4. fecha y autor;
5. plan de rollback si corresponde.

## 10) Descargo

`Polia` es una herramienta de apoyo a la deliberación pública. Sus resultados son estimaciones sujetas a incertidumbre y no constituyen asesoramiento legal, financiero ni electoral.
