// Servicio para obtener mortalidad infantil (DEIS)

export interface MortalidadInfantilDato {
  anio: number;
  valor: number;
}

const DEIS_SERIES_URL =
  'http://datos.salud.gob.ar/dataset/2eff770c-1c2b-4a22-9281-c3b5e9412086/resource/c1253897-d507-41f7-a3e1-6ed756e7243b/download/tasa-mortalidad-infantil-deis-1990-2023.csv';

const parseCsv = (text: string): string[][] => {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.split(','));
};

export async function cargarMortalidadInfantilDEIS(): Promise<Map<number, number>> {
  const response = await fetch(DEIS_SERIES_URL);

  if (!response.ok) {
    throw new Error('No se pudo cargar la serie de mortalidad infantil del DEIS.');
  }

  const csvText = await response.text();
  const rows = parseCsv(csvText);
  const header = rows[0];
  const mapa = new Map<number, number>();

  if (!header) {
    return mapa;
  }

  const indiceTiempo = header.indexOf('indice_tiempo');
  const indiceArgentina = header.indexOf('mortalidad_infantil_argentina');

  if (indiceTiempo === -1 || indiceArgentina === -1) {
    return mapa;
  }

  rows.slice(1).forEach(row => {
    const fecha = row[indiceTiempo];
    const valorRaw = row[indiceArgentina];
    const anio = fecha ? Number(fecha.slice(0, 4)) : NaN;
    const valor = Number(valorRaw);

    if (Number.isFinite(anio) && Number.isFinite(valor)) {
      mapa.set(anio, valor);
    }
  });

  return mapa;
}
