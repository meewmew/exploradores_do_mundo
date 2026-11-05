// A simplificação pode reduzir ilhas a um único ponto, sem área ou traço visível.
export function removeCollapsedMapRings(path) {
  return path.replace(/M([^MLZ]+)(?:L\1)+Z/g, '');
}
