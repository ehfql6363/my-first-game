import { describe, expect, it } from 'vitest';
import { drawCapsule, GRADES, itemRates, poolFor, type GachaTable } from './gacha';

const TABLE: GachaTable = {
  cost: 100,
  pity: 30,
  rates: { white: 0.55, blue: 0.3, purple: 0.12, gold: 0.03 },
  duplicateRefund: 40,
  items: [
    { id: 'w1', name: 'w1', grade: 'white', kind: 'relic' },
    { id: 'w2', name: 'w2', grade: 'white', kind: 'relic' },
    { id: 'b1', name: 'b1', grade: 'blue', kind: 'relic' },
    { id: 'p1', name: 'p1', grade: 'purple', kind: 'companion' },
    { id: 'g1', name: 'g1', grade: 'gold', kind: 'companion' },
  ],
};

describe('캡슐 기계', () => {
  it('아이템별 확률의 합은 100%이고 같은 등급끼리는 같다', () => {
    const rates = itemRates(TABLE);
    expect(rates.reduce((s, r) => s + r.rate, 0)).toBeCloseTo(1, 10);
    expect(rates.find((r) => r.item.id === 'w1')!.rate).toBeCloseTo(0.275, 10);
  });

  it('같은 시드면 같은 결과', () => {
    expect(drawCapsule(TABLE, 0, 123)).toEqual(drawCapsule(TABLE, 0, 123));
  });

  it('천장: 금색 없이 29번 뽑았으면 30번째는 반드시 금색이고, 금색이 나오면 카운트가 0으로', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const r = drawCapsule(TABLE, TABLE.pity - 1, seed);
      expect(r.item.grade).toBe('gold');
      expect(r.pityCount).toBe(0);
    }
  });

  it('실제로 뽑아 보면 공개한 확률과 맞는다 (10만 회, 오차 0.5%p 이내)', () => {
    const counts = Object.fromEntries(GRADES.map((g) => [g, 0])) as Record<string, number>;
    const N = 100_000;
    for (let seed = 1; seed <= N; seed++) counts[drawCapsule(TABLE, 0, seed * 2654435761).item.grade]++;
    for (const g of GRADES) expect(Math.abs(counts[g] / N - TABLE.rates[g])).toBeLessThan(0.005);
  });

  it('천장까지 포함하면 금색이 30회 안에 반드시 한 번은 나온다', () => {
    for (let start = 1; start <= 200; start++) {
      let pity = 0;
      let gotGold = false;
      for (let i = 0; i < TABLE.pity; i++) {
        const r = drawCapsule(TABLE, pity, start * 1000 + i);
        pity = r.pityCount;
        if (r.item.grade === 'gold') gotGold = true;
      }
      expect(gotGold).toBe(true);
    }
  });

  it('엔딩으로 풀리는 아이템은 그 엔딩을 보기 전에는 풀과 확률표에 없다', () => {
    const t: GachaTable = { ...TABLE, items: [...TABLE.items, { id: 'minji', name: '민지', grade: 'gold', kind: 'companion', unlockEnding: 'resign' }] };
    expect(poolFor(t, []).items.some((i) => i.id === 'minji')).toBe(false);
    expect(poolFor(t, ['resign']).items.some((i) => i.id === 'minji')).toBe(true);
    expect(itemRates(poolFor(t, [])).reduce((a, r) => a + r.rate, 0)).toBeCloseTo(1, 10);
    expect(itemRates(poolFor(t, ['resign'])).reduce((a, r) => a + r.rate, 0)).toBeCloseTo(1, 10);
  });
});
