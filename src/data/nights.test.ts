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
      if (a.gaze) continue;
      if (a.clue && !chaseClues) continue;
      const idx = s.hand.findIndex((id) => CARDS[id].response === a.requires);
      if (idx < 0) continue;
      const r = playCard(night, CARDS, s, idx, a.cameraId);
      if (r.ok) s = r.state;
    }
    // "보지 마십시오": 보면 안 되는 화면이 아닌 카메라를 보며 턴을 끝낸다
    const gazed = new Set(activeAnomalies(night, s).filter((a) => a.gaze).map((a) => a.cameraId));
    s = endTurn(night, s, night.cameras.find((c) => !gazed.has(c.id))?.id);
  }
  return s;
}

/** n일차에 평범한 플레이어가 가졌을 덱: 시작 덱 + 보상 (n-1)장 + 5일차부터 태오 피규어 카드 */
function typicalDeck(day: number, extra: string[] = []): string[] {
  const rewards = Array.from({ length: day - 1 }, (_, k) => REWARD_POOL[k % REWARD_POOL.length]);
  return [...STARTER_DECK, ...rewards, ...(day >= 5 ? ['excuse'] : []), ...extra];
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

  it('"보지 마십시오" 이상 현상은 기한이 있다 (영원히 볼 수 없는 카메라는 없다)', () => {
    for (const a of night.anomalies.filter((x) => x.gaze)) expect(a.expiresAtTurn, a.id).toBeDefined();
  });

  it('복원되는 수칙은 존재하는 수칙 번호와 단서를 가리킨다', () => {
    for (const r of night.restored ?? []) {
      expect(night.rules.some((x) => x.no === r.ruleNo)).toBe(true);
      expect(CLUES[r.clue]).toBeDefined();
    }
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

  it.each([
    [3, 0.9],
    [4, 0.85],
    [5, 0.8],
    [6, 0.85],
    [7, 0.65],
  ])('%i일차: 평범한 덱으로 수칙대로 하면 %f 이상 생존 (7일차가 가장 어렵다)', (day, min) => {
    expect(survivalRate(NIGHTS[day - 1], typicalDeck(day))).toBeGreaterThanOrEqual(min);
    expect(survivalRate(NIGHTS[day - 1], typicalDeck(day), true)).toBeGreaterThanOrEqual(min);
  });

  it('3일차에 문루 배터리를 두 번 받아 저주 카드 2장이 섞여도 4일차는 80% 이상 생존', () => {
    expect(survivalRate(NIGHTS[3], typicalDeck(4, ['laughter', 'laughter']))).toBeGreaterThanOrEqual(0.8);
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

import { ENDING_DEFS } from './endings';
import { SPEAKERS } from './dialogue';
import { STORY_COMPANIONS } from './companions';

describe('스토리', () => {
  it('스포일러 금지: 5일차까지의 수칙·메모·대사·단서에 주인공 이름이 없다', () => {
    const early: string[] = [];
    for (const n of NIGHTS.filter((x) => x.day <= 5)) {
      early.push(...n.rules.map((r) => r.text), n.memo ?? '', ...(n.loopMemos ?? []).map((m) => m.text));
      for (const a of n.anomalies) early.push(a.name, a.resolvedText ?? '', a.expiredText ?? '');
    }
    for (const c of Object.values(CLUES).filter((x) => x.day < 6)) early.push(c.name, c.text);
    for (const sp of SPEAKERS) for (const [day, lines] of Object.entries(sp.lines)) if (Number(day) < 6) early.push(...lines);
    const taeo = STORY_COMPANIONS['taeo-figure'];
    early.push(taeo.capsuleLine, ...taeo.lines, ...(taeo.choice?.options.map((o) => o.reply) ?? []));
    for (const t of early) expect(t, t).not.toMatch(/달희/);
  });

  it('스토리 동료는 캡슐 기계의 무작위 풀에 없다', () => {
    for (const id of Object.keys(STORY_COMPANIONS)) expect(GACHA.items.some((i) => i.id === id), id).toBe(false);
  });

  it('엔딩 3종이 모두 정의돼 있고, 폐장 엔딩 문장에만 이름을 부르는 장면이 있다', () => {
    expect(Object.keys(ENDING_DEFS).sort()).toEqual(['closing', 'regular', 'resign']);
    expect(ENDING_DEFS.closing.choice).toMatch(/내 이름은/);
  });

  it('모든 스토리 동료 카드와 단서 선택지는 존재하는 것을 가리킨다', () => {
    for (const c of Object.values(STORY_COMPANIONS)) {
      expect(CARDS[c.card]).toBeDefined();
      for (const o of c.choice?.options ?? []) if (o.clue) expect(CLUES[o.clue]).toBeDefined();
    }
  });
});
