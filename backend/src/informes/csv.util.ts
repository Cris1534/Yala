export function aCsv(filas: Record<string, unknown>[]): string {
  if (!filas.length) return '';
  const columnas = Object.keys(filas[0]);
  const escapar = (valor: unknown) => {
    const texto = valor === null || valor === undefined ? '' : String(valor);
    return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };
  const lineas = [columnas.join(',')];
  for (const fila of filas) {
    lineas.push(columnas.map((c) => escapar(fila[c])).join(','));
  }
  return lineas.join('\n');
}
