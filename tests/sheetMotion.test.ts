import { describe, expect, it } from 'vitest';
import { sheetOffset, shouldOpenCountries, settleSheet } from '../src/services/sheetMotion';

describe('atalho da ficha por arraste', () => {
  it('acompanha o dedo e oferece resistência progressiva nas bordas', () => {
    expect(sheetOffset(60)).toBe(60);
    expect(sheetOffset(140)).toBe(140);
    expect(sheetOffset(150)).toBeGreaterThan(140);
    expect(sheetOffset(150)).toBeLessThan(150);
    expect(sheetOffset(2000)).toBeLessThan(320);
    expect(sheetOffset(-50)).toBeGreaterThan(-50);
    expect(sheetOffset(-50)).toBeLessThan(0);
  });

  it('aceita arraste deliberado e flick, mas permite reverter a decisão', () => {
    expect(shouldOpenCountries(100, 0)).toBe(true);
    expect(shouldOpenCountries(35, 600)).toBe(true);
    expect(shouldOpenCountries(35, 0)).toBe(false);
    expect(shouldOpenCountries(120, -150)).toBe(false);
  });

  it('retorna ao repouso sem ultrapassar a origem ao soltar parado', () => {
    let current = { position: 80, velocity: 0 };
    for (let i = 0; i < 120; i++) {
      const next = settleSheet(current.position, current.velocity, 1 / 60);
      expect(next.position).toBeGreaterThanOrEqual(0);
      expect(next.position).toBeLessThanOrEqual(current.position);
      current = next;
    }
    expect(current.position).toBeLessThan(.01);
    expect(Math.abs(current.velocity)).toBeLessThan(.01);
  });

  it('mantém a velocidade inicial e converge com intervalos de quadros diferentes', () => {
    expect(settleSheet(40, 100, 0)).toEqual({ position: 40, velocity: 100 });
    const first = settleSheet(40, 100, .016);
    const split = settleSheet(first.position, first.velocity, .024);
    const single = settleSheet(40, 100, .04);
    expect(split.position).toBeCloseTo(single.position, 8);
    expect(split.velocity).toBeCloseTo(single.velocity, 8);
  });
});
