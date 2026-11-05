export function sheetOffset(raw: number): number {
  const rubber = (amount: number) => amount * .55 * 180 / (180 + Math.abs(amount) * .55);
  return raw < 0 ? rubber(raw) : raw > 140 ? 140 + rubber(raw - 140) : raw;
}

export function shouldOpenCountries(position: number, velocity: number): boolean {
  const decelerationRate = .99;
  const projected = position + (velocity / 1000) * decelerationRate / (1 - decelerationRate);
  return velocity >= 0 && projected > 90;
}

export function settleSheet(position: number, velocity: number, seconds: number) {
  // Mola crítica: preserva posição/velocidade e permite ser interrompida sem salto.
  const frequency = 20;
  const carry = velocity + frequency * position;
  const decay = Math.exp(-frequency * seconds);
  return {
    position: (position + carry * seconds) * decay,
    velocity: (velocity - frequency * carry * seconds) * decay,
  };
}
