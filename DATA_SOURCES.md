# Fuentes de Datos - Polia v1

## Objetivo

Documentar fuentes, frecuencia y confiabilidad de los datos utilizados por la app para garantizar trazabilidad y transparencia.

## Política de selección de fuentes

Prioridad de uso:
1. fuentes oficiales del Estado;
2. organismos públicos internacionales;
3. proveedores secundarios con metodología pública;
4. fallback manual documentado.

Se evita usar fuentes sin metodología verificable.

## Inventario inicial (v1)

### Inflación (IPC)
- Fuente objetivo: INDEC
- Cobertura esperada: mensual
- Método de ingesta: descarga/parseo de serie oficial
- Estado: pendiente de automatización completa

### Desempleo
- Fuente objetivo: INDEC (EPH)
- Cobertura esperada: trimestral/semestral (según serie elegida)
- Método de ingesta: dataset público + normalización
- Estado: parcial

### Riesgo país
- Fuente objetivo: series públicas (ej. FRED) + fallback local
- Cobertura esperada: diaria/mensual agregada
- Método de ingesta: API + respaldo local
- Estado: implementado con fallback

### PIB, salarios reales, inversión, exportaciones
- Fuente objetivo: INDEC / BCRA / series oficiales complementarias
- Cobertura esperada: trimestral/anual
- Método de ingesta: carga por scripts y normalización temporal
- Estado: mixto (parte histórica manual + parte oficial)

## Campos mínimos por dataset

Cada serie debe incluir:
- `nombre_variable`
- `fuente`
- `url_origen`
- `fecha_descarga`
- `periodicidad`
- `unidad`
- `cobertura_temporal`
- `transformaciones_aplicadas`
- `responsable_carga`

## Reglas de calidad de datos

- no usar series sin fecha de actualización;
- no mezclar unidades sin transformación explícita;
- versionar cambios de estructura;
- guardar datos crudos cuando sea posible;
- registrar imputaciones o interpolaciones.

## Frecuencia de actualización sugerida

- Variables de alta volatilidad: semanal/mensual.
- Variables estructurales: mensual/trimestral.
- Revisión general de consistencia: quincenal.

## Riesgos operativos

- API externa caída o con límites;
- cambios de formato en fuente oficial;
- retrasos de publicación;
- inconsistencia entre series de distintos organismos.

## Mitigaciones operativas

- fallback local documentado;
- validaciones automáticas de esquema;
- alertas de datos desactualizados en interfaz;
- caché con expiración y log de ingestas.

## Próximos pasos

- [ ] crear carpeta `data/raw` y `data/processed` con convención estable;
- [ ] script de actualización por fuente prioritaria;
- [ ] tablero interno de estado de fuentes;
- [ ] publicar fecha de última actualización visible en cada módulo.
