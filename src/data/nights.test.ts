import { describe, expect, it } from 'vitest';
import { activeAnomalies, createNight, endTurn, playCard } from '../core/night';
import type { NightDef, NightState } from '../core/types';
import { CARDS, REWARD_POOL, STARTER_DECK } from './cards';
import { CLUES } from './clues';
import { NIGHTS } from './nights';

// 수칙서를 그대로 믿고 성실히 대응하는 플레이어 흉내 (거짓 수칙이 걸린 이상 현상은 건드리지 않는다).
function playByTheBook(night: NightDef, deck: string[], seed: number, chaseClues = false): NightState {
  let s = createNight(night, deck, seed);
  while (s.outcome === 'playing') {
    for (const a of activeAnomalies(night, s)) {
      if (a.clue && !chaseClues) continue;
      const idx = s.hand.findIndex((id) => CARDS[id].response === a.requires);
      if (idx < 0) continue;
      const r = playCard(night, CARDS, s, idx, a.cameraId);
      if (r.ok) s = r.state;
    }
    s = endTurn(night, s);
  }
  return s;
}

function survivalRate(night: NightDef, deck: string[], chaseClues = false): number {
  let ok = 0;
  for (let seed = 1; seed <= 200; seed++) if (playByTheBook(night, deck, seed, chaseClues).outcome === 'survived') ok++;
  return ok / 200;
}

describe.each(NIGHTS.map((n) => [n.id, n] as const))('%s 데이터', (_, night) => {
  it('이상 현상은 있는 카메라에, 근무 시간 안에 나오고 id가 겹치지 않는다', () => {
    const cams = new Set(night.cameras.map((c) => c.id));
    for (const a of night.anomalies) {
      expect(cams.has(a.cameraId)).toBe(true);
      expect(a.appearsAtTurn).toBeLessThan(night.endTurn);
      if (a.expiresAtTurn !== undefined) expect(a.expiresAtTurn).toBeGreaterThan(a.appearsAtTurn);
      if (a.clue) expect(CLUES[a.clue]).toBeDefined();
    }
    const ids = night.anomalies.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('거짓 수칙에 걸린 이상 현상은 무시해도 위험하지 않다 (단서 없는 함정 금지)', () => {
    for (const a of night.anomalies.filter((x) => x.clue)) expect(a.riskPerTurn).toBe(0);
  });

  it('아무것도 하지 않으면 살아남을 수 없다', () => {
    for (let seed = 1; seed <= 20; seed++) {
      let s = createNight(night, STARTER_DECK, seed);
      while (s.outcome === 'playing') s = endTurn(night, s);
      expect(s.outcome).toBe('failed');
    }
  });
});

describe('밸런스', () => {
  it('1일차: 시작 덱으로 수칙대로 하면 95% 이상 생존', () => {
    expect(survivalRate(NIGHTS[0], STARTER_DECK)).toBeGreaterThanOrEqual(0.95);
  });

  it('2일차: 시작 덱 + 보상 1장 어느 것이든 80% 이상 생존 (조금 더 어렵게)', () => {
    for (const reward of REWARD_POOL) {
      const rate = survivalRate(NIGHTS[1], [...STARTER_DECK, reward]);
      expect(rate, reward).toBeGreaterThanOrEqual(0.8);
      expect(rate, reward).toBeLessThan(1.0001);
    }
  });

  it('2일차: 거짓 수칙을 간파해 단서를 챙겨도 80% 이상 생존 (대가는 있지만 함정은 아니다)', () => {
    for (const reward of REWARD_POOL) expect(survivalRate(NIGHTS[1], [...STARTER_DECK, reward], true), reward).toBeGreaterThanOrEqual(0.8);
  });

  it('보상 카드는 모두 존재하는 카드다', () => {
    for (const id of REWARD_POOL) expect(CARDS[id]).toBeDefined();
  });
});

import { itemRates } from '../core/gacha';
import { COMPANIONS } from './companions';
import { GACHA } from './gacha';
import { RELICS } from './relics';

describe('캡슐 기계 데이터', () => {
  it('등급 확률 합 100%, 모든 등급에 아이템이 있다', () => {
    const sum = Object.values(GACHA.rates).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 10);
    for (const g of Object.keys(GACHA.rates)) expect(GACHA.items.some((i) => i.grade === g), g).toBe(true);
    expect(itemRates(GACHA).reduce((a, r) => a + r.rate, 0)).toBeCloseTo(1, 10);
  });

  it('아이템 id는 겹치지 않고, 주는 카드는 모두 존재한다', () => {
    const ids = GACHA.items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const i of GACHA.items) if (i.grantsCard) expect(CARDS[i.grantsCard], i.id).toBeDefined();
  });

  it('스토리 단서는 캡슐 기계에 없다', () => {
    for (const i of GACHA.items) expect(CLUES[i.id]).toBeUndefined();
  });

  it('동료 3명, 기념품 6개', () => {
    expect(Object.keys(COMPANIONS)).toHaveLength(3);
    expect(Object.keys(RELICS)).toHaveLength(6);
  });
});

import { combineMods } from '../core/types';

describe('기념품 밸런스', () => {
  it('어떤 기념품 2개 조합으로도 2일차 생존율이 85% 아래로 떨어지지 않는다 (저주는 작아야 한다)', () => {
    const ids = Object.keys(RELICS);
    for (let i = 0; i < ids.length; i++)
      for (let j = i; j < ids.length; j++) {
        const set = i === j ? [ids[i]] : [ids[i], ids[j]];
        const mods = combineMods(set.map((r) => RELICS[r].effect));
        let ok = 0;
        for (let seed = 1; seed <= 100; seed++) {
          const night = NIGHTS[1];
          let s = createNight(night, STARTER_DECK, seed, mods);
          while (s.outcome === 'playing') {
            for (const a of activeAnomalies(night, s)) {
              if (a.clue) continue;
              const idx = s.hand.findIndex((id) => CARDS[id].response === a.requires);
              if (idx < 0) continue;
              const r = playCard(night, CARDS, s, idx, a.cameraId);
              if (r.ok) s = r.state;
            }
            s = endTurn(night, s);
          }
          if (s.outcome === 'survived') ok++;
        }
        expect(ok / 100, set.join('+')).toBeGreaterThanOrEqual(0.85);
      }
  });
});
