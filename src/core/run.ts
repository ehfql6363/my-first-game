// 한 회차(7일) 진행. 밤 사이의 상태(덱, 수당, 단서)를 관리한다.

import { drawCapsule, type GachaItem, type GachaTable } from './gacha';
import { nextRandom, shuffle } from './rng';
import type { NightDef, NightState } from './types';

export type RunPhase = 'day' | 'reward' | 'failed' | 'demo-end';

export interface RunState {
  version: 2;
  /** 다음에 근무할 날 (1부터) */
  day: number;
  /** 몇 번째 회차인지. 실패하면 1일차부터 다시 시작하고 1 오른다 */
  loop: number;
  phase: RunPhase;
  deck: string[];
  money: number;
  clues: string[];
  /** 오늘 밤 수칙서에서 의심 표시한 수칙 번호 */
  suspected: number[];
  /** 보상 단계에서 고를 수 있는 카드 */
  rewardOptions: string[];
  /** 직전 밤 결과 요약 (보상·실패 화면용) */
  lastNight: { day: number; pay: number; resolved: number; newClues: string[] } | null;
  seed: number;
  // ── 여기부터는 회차가 바뀌어도 남는다 ──
  /** 캡슐 기계에서 얻은 것 (카드 아이템은 여러 번 가질 수 있음) */
  owned: string[];
  /** 장착한 기념품 (최대 RELIC_SLOTS) */
  equipped: string[];
  /** 마지막 금색 이후 뽑은 횟수 (천장) */
  pity: number;
  /** 지금까지 뽑은 횟수 (뽑기 시드용) */
  draws: number;
}

export const RELIC_SLOTS = 2;

/** 회차가 바뀌어도 남는 것: 수당, 단서, 캡슐 기계에서 얻은 것, 장착, 천장 카운트 */
type Carry = Pick<RunState, 'money' | 'clues' | 'owned' | 'equipped' | 'pity' | 'draws'>;
const EMPTY_CARRY: Carry = { money: 0, clues: [], owned: [], equipped: [], pity: 0, draws: 0 };

export const PAY = { base: 50, perResolved: 15 } as const;

export function newRun(starterDeck: string[], seed: number, loop = 1, carry: Carry = EMPTY_CARRY, table?: GachaTable): RunState {
  return {
    version: 2,
    day: 1,
    loop,
    phase: 'day',
    deck: startingDeck(starterDeck, carry.owned, table),
    suspected: [],
    rewardOptions: [],
    lastNight: null,
    seed,
    ...carry,
  };
}

/** 회차 시작 덱 = 기본 덱 + 캡슐 기계에서 얻은 카드 */
export function startingDeck(starterDeck: string[], owned: string[], table?: GachaTable): string[] {
  const granted = table ? owned.map((id) => table.items.find((i) => i.id === id)?.grantsCard).filter((c): c is string => !!c) : [];
  return [...starterDeck, ...granted];
}

/** 같은 회차·같은 날이면 같은 밤이 나온다 */
export function nightSeed(run: RunState): number {
  return (run.seed + run.day * 7919 + run.loop * 104729) >>> 0;
}

export function toggleSuspect(run: RunState, ruleNo: number): RunState {
  const suspected = run.suspected.includes(ruleNo) ? run.suspected.filter((n) => n !== ruleNo) : [...run.suspected, ruleNo].sort((a, b) => a - b);
  return { ...run, suspected };
}

export function settleNight(run: RunState, night: NightDef, result: NightState, rewardPool: string[], lastDay: number, payBonus = 0): RunState {
  if (result.outcome === 'playing') return run;
  if (result.outcome === 'failed') {
    return { ...run, phase: 'failed', lastNight: { day: run.day, pay: 0, resolved: result.resolved.length, newClues: [] } };
  }
  const newClues = night.anomalies
    .filter((a) => a.clue && result.resolved.includes(a.id) && !run.clues.includes(a.clue))
    .map((a) => a.clue!);
  const pay = Math.round((PAY.base + PAY.perResolved * result.resolved.length) * (1 + payBonus));
  const options = pickDistinct(rewardPool, 3, run.seed + run.day * 31 + run.loop);
  return {
    ...run,
    phase: run.day >= lastDay ? 'demo-end' : 'reward',
    money: run.money + pay,
    clues: [...run.clues, ...newClues],
    rewardOptions: options,
    lastNight: { day: run.day, pay, resolved: result.resolved.length, newClues },
  };
}

/** 보상 카드를 고르거나(cardId) 건너뛰고(null) 다음 날 낮으로 */
export function chooseReward(run: RunState, cardId: string | null): RunState {
  if (run.phase !== 'reward') return run;
  if (cardId !== null && !run.rewardOptions.includes(cardId)) return run;
  return {
    ...run,
    phase: 'day',
    day: run.day + 1,
    deck: cardId ? [...run.deck, cardId] : run.deck,
    suspected: [],
    rewardOptions: [],
  };
}

/** 실패 후 다시 출근. 회차가 오르고 1일차부터. 수당·단서·캡슐 기계에서 얻은 것은 남는다 */
export function restartRun(run: RunState, starterDeck: string[], table?: GachaTable): RunState {
  const { money, clues, owned, equipped, pity, draws } = run;
  return newRun(starterDeck, run.seed, run.loop + 1, { money, clues, owned, equipped, pity, draws }, table);
}

export type PullResult = { run: RunState; item: GachaItem; duplicate: boolean };

/** 캡슐 한 번. 수당이 모자라면 null. 이미 가진 동료·기념품이면 일부 환급 */
export function pullCapsule(run: RunState, table: GachaTable): PullResult | null {
  if (run.money < table.cost) return null;
  const { item, pityCount } = drawCapsule(table, run.pity, (run.seed ^ Math.imul(run.draws + 1, 2654435761)) >>> 0);
  const duplicate = item.kind !== 'card' && run.owned.includes(item.id);
  const next: RunState = {
    ...run,
    money: run.money - table.cost + (duplicate ? table.duplicateRefund : 0),
    pity: pityCount,
    draws: run.draws + 1,
    owned: duplicate ? run.owned : [...run.owned, item.id],
    deck: !duplicate && item.grantsCard ? [...run.deck, item.grantsCard] : run.deck,
  };
  return { run: next, item, duplicate };
}

/** 기념품 장착/해제. 칸이 꽉 찼으면 변화 없음 */
export function toggleEquip(run: RunState, relicId: string): RunState {
  if (run.equipped.includes(relicId)) return { ...run, equipped: run.equipped.filter((r) => r !== relicId) };
  if (!run.owned.includes(relicId) || run.equipped.length >= RELIC_SLOTS) return run;
  return { ...run, equipped: [...run.equipped, relicId] };
}

function pickDistinct(pool: string[], count: number, seed: number): string[] {
  const [, s] = nextRandom(seed);
  return shuffle(pool, s)[0].slice(0, Math.min(count, pool.length));
}
