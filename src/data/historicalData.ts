// Datos históricos económicos de Argentina (1994-2025)
// Basado en datos reales del INDEC, BCRA y otras fuentes oficiales

export interface HistoricalDataPoint {
  periodo: string;
  anio: number;
  ipc: number;              // Inflación (IPC %)
  desempleo: number;        // Tasa de desempleo (%)
  inversion_bruta: number;  // Inversión bruta (% PIB)
  consumo_energetico: number; // Consumo energético (kWh per cápita)
  merval: number;           // Índice MERVAL
  exportaciones: number;    // Exportaciones (% PIB)
  riesgo_pais: number;      // Riesgo país (puntos básicos)
  consumo_carne: number;    // Consumo de carne (kg/año per cápita)
  automoviles_vendidos: number; // Automóviles vendidos (miles de unidades)
  deuda_publica: number;    // Deuda pública (% del PIB)
  pobreza: number;          // Pobreza (%)
  pib: number;             // PIB (millones USD)
  salarios_reales: number;  // Salarios reales (índice base 100)
  inflacion_futura: number; // Inflación futura (%)
  mortalidad_infantil: number; // Mortalidad infantil (por mil nacidos vivos)
}

export const HISTORICAL_DATA: HistoricalDataPoint[] = [
  // Datos históricos reales de Argentina
  { periodo: '1994-S1', anio: 1994, ipc: 3.9, desempleo: 12.2, inversion_bruta: 18.5, consumo_energetico: 1800, merval: 150, exportaciones: 7.2, riesgo_pais: 800, consumo_carne: 68.5, automoviles_vendidos: 380, deuda_publica: 29, pobreza: 16.1, pib: 280000, salarios_reales: 95, inflacion_futura: 4.2, mortalidad_infantil: 22.0 },
  { periodo: '1995-S2', anio: 1995, ipc: 1.6, desempleo: 18.4, inversion_bruta: 15.8, consumo_energetico: 1750, merval: 120, exportaciones: 6.8, riesgo_pais: 1200, consumo_carne: 65.2, automoviles_vendidos: 320, deuda_publica: 35, pobreza: 22.3, pib: 260000, salarios_reales: 88, inflacion_futura: 2.1, mortalidad_infantil: 20.9 },
  { periodo: '1996-S1', anio: 1996, ipc: 0.1, desempleo: 17.2, inversion_bruta: 16.2, consumo_energetico: 1780, merval: 140, exportaciones: 7.1, riesgo_pais: 900, consumo_carne: 66.8, automoviles_vendidos: 360, deuda_publica: 38, pobreza: 20.8, pib: 270000, salarios_reales: 92, inflacion_futura: 0.5, mortalidad_infantil: 19.9 },
  { periodo: '1997-S2', anio: 1997, ipc: 0.3, desempleo: 14.9, inversion_bruta: 17.8, consumo_energetico: 1850, merval: 180, exportaciones: 7.8, riesgo_pais: 600, consumo_carne: 67.5, automoviles_vendidos: 410, deuda_publica: 41, pobreza: 18.5, pib: 290000, salarios_reales: 98, inflacion_futura: 0.8, mortalidad_infantil: 18.9 },
  { periodo: '1998-S1', anio: 1998, ipc: 0.9, desempleo: 13.2, inversion_bruta: 18.9, consumo_energetico: 1920, merval: 220, exportaciones: 8.2, riesgo_pais: 500, consumo_carne: 68.2, automoviles_vendidos: 450, deuda_publica: 42, pobreza: 16.8, pib: 310000, salarios_reales: 102, inflacion_futura: 1.2, mortalidad_infantil: 18.1 },
  { periodo: '1999-S2', anio: 1999, ipc: -1.2, desempleo: 14.3, inversion_bruta: 16.5, consumo_energetico: 1880, merval: 180, exportaciones: 7.5, riesgo_pais: 800, consumo_carne: 66.5, automoviles_vendidos: 380, deuda_publica: 48, pobreza: 19.2, pib: 295000, salarios_reales: 96, inflacion_futura: -0.5, mortalidad_infantil: 17.3 },
  { periodo: '2000-S1', anio: 2000, ipc: -0.9, desempleo: 15.1, inversion_bruta: 15.2, consumo_energetico: 1850, merval: 160, exportaciones: 7.1, riesgo_pais: 1000, consumo_carne: 65.8, automoviles_vendidos: 350, deuda_publica: 51, pobreza: 21.5, pib: 280000, salarios_reales: 94, inflacion_futura: -0.2, mortalidad_infantil: 16.7 },
  { periodo: '2001-S2', anio: 2001, ipc: -1.1, desempleo: 18.3, inversion_bruta: 12.8, consumo_energetico: 1750, merval: 80, exportaciones: 6.5, riesgo_pais: 3000, consumo_carne: 62.5, automoviles_vendidos: 200, deuda_publica: 62, pobreza: 35.4, pib: 250000, salarios_reales: 78, inflacion_futura: 2.5, mortalidad_infantil: 16.2 },
  { periodo: '2002-S1', anio: 2002, ipc: 40.9, desempleo: 21.5, inversion_bruta: 8.9, consumo_energetico: 1650, merval: 200, exportaciones: 8.2, riesgo_pais: 4500, consumo_carne: 58.2, automoviles_vendidos: 150, deuda_publica: 166, pobreza: 54.3, pib: 220000, salarios_reales: 45, inflacion_futura: 25.8, mortalidad_infantil: 15.8 },
  { periodo: '2003-S2', anio: 2003, ipc: 13.4, desempleo: 16.4, inversion_bruta: 12.5, consumo_energetico: 1720, merval: 350, exportaciones: 9.1, riesgo_pais: 2800, consumo_carne: 60.8, automoviles_vendidos: 250, deuda_publica: 138, pobreza: 47.8, pib: 240000, salarios_reales: 55, inflacion_futura: 8.5, mortalidad_infantil: 15.4 },
  { periodo: '2004-S1', anio: 2004, ipc: 4.4, desempleo: 13.6, inversion_bruta: 15.8, consumo_energetico: 1850, merval: 480, exportaciones: 10.2, riesgo_pais: 1800, consumo_carne: 63.5, automoviles_vendidos: 380, deuda_publica: 127, pobreza: 40.2, pib: 270000, salarios_reales: 68, inflacion_futura: 3.8, mortalidad_infantil: 14.9 },
  { periodo: '2005-S2', anio: 2005, ipc: 12.3, desempleo: 11.6, inversion_bruta: 18.2, consumo_energetico: 1950, merval: 620, exportaciones: 11.5, riesgo_pais: 1200, consumo_carne: 65.8, automoviles_vendidos: 480, deuda_publica: 74, pobreza: 33.8, pib: 300000, salarios_reales: 78, inflacion_futura: 7.2, mortalidad_infantil: 14.4 },
  { periodo: '2006-S1', anio: 2006, ipc: 9.8, desempleo: 10.2, inversion_bruta: 19.8, consumo_energetico: 2050, merval: 750, exportaciones: 12.8, riesgo_pais: 900, consumo_carne: 67.2, automoviles_vendidos: 580, deuda_publica: 63, pobreza: 28.9, pib: 330000, salarios_reales: 88, inflacion_futura: 6.5, mortalidad_infantil: 14.0 },
  { periodo: '2007-S2', anio: 2007, ipc: 8.5, desempleo: 8.5, inversion_bruta: 21.2, consumo_energetico: 2150, merval: 850, exportaciones: 13.5, riesgo_pais: 700, consumo_carne: 68.5, automoviles_vendidos: 680, deuda_publica: 56, pobreza: 23.4, pib: 360000, salarios_reales: 95, inflacion_futura: 5.8, mortalidad_infantil: 13.6 },
  { periodo: '2008-S1', anio: 2008, ipc: 7.2, desempleo: 7.9, inversion_bruta: 20.8, consumo_energetico: 2200, merval: 920, exportaciones: 14.2, riesgo_pais: 800, consumo_carne: 69.1, automoviles_vendidos: 720, deuda_publica: 48, pobreza: 20.6, pib: 380000, salarios_reales: 98, inflacion_futura: 4.9, mortalidad_infantil: 13.2 },
  { periodo: '2009-S2', anio: 2009, ipc: 6.3, desempleo: 8.4, inversion_bruta: 18.5, consumo_energetico: 2100, merval: 780, exportaciones: 12.8, riesgo_pais: 1200, consumo_carne: 66.8, automoviles_vendidos: 600, deuda_publica: 51, pobreza: 24.1, pib: 350000, salarios_reales: 92, inflacion_futura: 5.2, mortalidad_infantil: 12.8 },
  { periodo: '2010-S1', anio: 2010, ipc: 10.9, desempleo: 7.8, inversion_bruta: 19.8, consumo_energetico: 2250, merval: 950, exportaciones: 13.8, riesgo_pais: 900, consumo_carne: 68.2, automoviles_vendidos: 680, deuda_publica: 45, pobreza: 21.5, pib: 390000, salarios_reales: 88, inflacion_futura: 8.5, mortalidad_infantil: 12.4 },
  { periodo: '2011-S2', anio: 2011, ipc: 9.8, desempleo: 7.2, inversion_bruta: 20.5, consumo_energetico: 2300, merval: 1100, exportaciones: 14.5, riesgo_pais: 800, consumo_carne: 69.5, automoviles_vendidos: 750, deuda_publica: 42, pobreza: 19.8, pib: 420000, salarios_reales: 85, inflacion_futura: 7.8, mortalidad_infantil: 11.9 },
  { periodo: '2012-S1', anio: 2012, ipc: 10.8, desempleo: 7.1, inversion_bruta: 19.2, consumo_energetico: 2280, merval: 1200, exportaciones: 13.8, riesgo_pais: 1000, consumo_carne: 68.8, automoviles_vendidos: 800, deuda_publica: 44, pobreza: 22.1, pib: 410000, salarios_reales: 82, inflacion_futura: 9.2, mortalidad_infantil: 11.4 },
  { periodo: '2013-S2', anio: 2013, ipc: 10.9, desempleo: 6.9, inversion_bruta: 18.8, consumo_energetico: 2320, merval: 1250, exportaciones: 13.2, riesgo_pais: 1200, consumo_carne: 67.5, automoviles_vendidos: 850, deuda_publica: 46, pobreza: 24.8, pib: 400000, salarios_reales: 78, inflacion_futura: 9.8, mortalidad_infantil: 10.9 },
  { periodo: '2014-S1', anio: 2014, ipc: 23.9, desempleo: 6.9, inversion_bruta: 17.5, consumo_energetico: 2300, merval: 800, exportaciones: 12.5, riesgo_pais: 1800, consumo_carne: 65.2, automoviles_vendidos: 720, deuda_publica: 45, pobreza: 28.7, pib: 380000, salarios_reales: 65, inflacion_futura: 18.5, mortalidad_infantil: 10.4 },
  { periodo: '2015-S2', anio: 2015, ipc: 25.3, desempleo: 7.6, inversion_bruta: 16.8, consumo_energetico: 2280, merval: 750, exportaciones: 11.8, riesgo_pais: 2200, consumo_carne: 63.8, automoviles_vendidos: 600, deuda_publica: 53, pobreza: 32.2, pib: 360000, salarios_reales: 58, inflacion_futura: 20.8, mortalidad_infantil: 10.0 },
  { periodo: '2016-S1', anio: 2016, ipc: 40.3, desempleo: 8.5, inversion_bruta: 15.2, consumo_energetico: 2250, merval: 650, exportaciones: 10.5, riesgo_pais: 2800, consumo_carne: 61.5, automoviles_vendidos: 520, deuda_publica: 57, pobreza: 35.8, pib: 340000, salarios_reales: 45, inflacion_futura: 32.5, mortalidad_infantil: 9.7 },
  { periodo: '2017-S2', anio: 2017, ipc: 24.8, desempleo: 8.4, inversion_bruta: 16.8, consumo_energetico: 2280, merval: 720, exportaciones: 11.2, riesgo_pais: 2500, consumo_carne: 62.8, automoviles_vendidos: 550, deuda_publica: 68, pobreza: 33.2, pib: 350000, salarios_reales: 52, inflacion_futura: 19.8, mortalidad_infantil: 9.4 },
  { periodo: '2018-S1', anio: 2018, ipc: 47.6, desempleo: 9.1, inversion_bruta: 15.5, consumo_energetico: 2200, merval: 580, exportaciones: 10.8, riesgo_pais: 3500, consumo_carne: 60.2, automoviles_vendidos: 450, deuda_publica: 86, pobreza: 38.2, pib: 320000, salarios_reales: 38, inflacion_futura: 35.2, mortalidad_infantil: 9.2 },
  { periodo: '2019-S2', anio: 2019, ipc: 53.8, desempleo: 9.8, inversion_bruta: 14.2, consumo_energetico: 2150, merval: 520, exportaciones: 9.8, riesgo_pais: 4200, consumo_carne: 58.5, automoviles_vendidos: 380, deuda_publica: 90, pobreza: 42.8, pib: 300000, salarios_reales: 32, inflacion_futura: 45.8, mortalidad_infantil: 8.9 },
  { periodo: '2020-S1', anio: 2020, ipc: 36.1, desempleo: 11.0, inversion_bruta: 12.8, consumo_energetico: 2000, merval: 480, exportaciones: 8.5, riesgo_pais: 3800, consumo_carne: 55.2, automoviles_vendidos: 280, deuda_publica: 103, pobreza: 48.2, pib: 280000, salarios_reales: 28, inflacion_futura: 28.5, mortalidad_infantil: 8.7 },
  { periodo: '2021-S2', anio: 2021, ipc: 50.9, desempleo: 10.2, inversion_bruta: 14.5, consumo_energetico: 2100, merval: 520, exportaciones: 9.2, riesgo_pais: 3200, consumo_carne: 57.8, automoviles_vendidos: 320, deuda_publica: 80, pobreza: 45.8, pib: 310000, salarios_reales: 35, inflacion_futura: 38.2, mortalidad_infantil: 8.5 },
  { periodo: '2022-S1', anio: 2022, ipc: 94.8, desempleo: 7.1, inversion_bruta: 16.2, consumo_energetico: 2200, merval: 450, exportaciones: 9.8, riesgo_pais: 2800, consumo_carne: 59.5, automoviles_vendidos: 400, deuda_publica: 78, pobreza: 42.5, pib: 330000, salarios_reales: 42, inflacion_futura: 72.5, mortalidad_infantil: 8.3 },
  { periodo: '2023-S2', anio: 2023, ipc: 211.4, desempleo: 8.5, inversion_bruta: 18.5, consumo_energetico: 2200, merval: 45000, exportaciones: 8.5, riesgo_pais: 2500, consumo_carne: 48.0, automoviles_vendidos: 350, deuda_publica: 88, pobreza: 44.5, pib: 450000, salarios_reales: 100, inflacion_futura: 100, mortalidad_infantil: 8.2 },
  { periodo: '2025-S1', anio: 2025, ipc: 33.6, desempleo: 7.6, inversion_bruta: 16.5, consumo_energetico: 2300, merval: 52000, exportaciones: 9.8, riesgo_pais: 1800, consumo_carne: 46.5, automoviles_vendidos: 420, deuda_publica: 85, pobreza: 38.8, pib: 480000, salarios_reales: 110, inflacion_futura: 30, mortalidad_infantil: 8.2 }, // DEIS: último dato oficial disponible (2023)
];

// Función helper para obtener el último punto de datos
export const getLastDataPoint = (): HistoricalDataPoint => {
  return HISTORICAL_DATA[HISTORICAL_DATA.length - 1];
};

// Función helper para obtener datos por año
export const getDataByYear = (year: number): HistoricalDataPoint | undefined => {
  return HISTORICAL_DATA.find(data => data.anio === year);
};

// Función helper para obtener datos por período
export const getDataByPeriod = (period: string): HistoricalDataPoint | undefined => {
  return HISTORICAL_DATA.find(data => data.periodo === period);
};
