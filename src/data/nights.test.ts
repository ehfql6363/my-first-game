import { describe, expect, it } from 'vitest';
import { activeAnomalies, createNight, endTurn, playCard } from '../core/night';
import type { NightDef, NightState } from '../core/types';
import { CARDS, REWARD_POOL, STARTER_DECK } from './cards';
import { CLUES } from './clues';
import { NIGHTS } from './nights';

// 수칙서를 그대로 믿고 성실히 대응하는 플레이어 흉내 (거짓 수칙이 걸린 이상 현상은 건드리지 않는다).
function playByTheBook(night: NightDef, deck: string[], seed: number): NightState {
  let s = createNight(night, deck, seed);
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
  return s;
}

function survivalRate(night: NightDef, deck: string[]): number {
  let ok = 0;
  for (let seed = 1; seed <= 200; seed++) if (playByTheBook(night, deck, seed).outcome === 'survived') ok++;
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

  it('보상 카드는 모두 존재하는 카드다', () => {
    for (const id of REWARD_POOL) expect(CARDS[id]).toBeDefined();
  });
});
