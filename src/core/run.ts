// 한 회차(7일) 진행. 밤 사이의 상태(덱, 수당, 단서)를 관리한다.

import { nextRandom, shuffle } from './rng';
import type { NightDef, NightState } from './types';

export type RunPhase = 'day' | 'reward' | 'failed' | 'demo-end';

export interface RunState {
  version: 1;
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
}

export const PAY = { base: 50, perResolved: 15 } as const;

export function newRun(starterDeck: string[], seed: number, loop = 1): RunState {
  return { version: 1, day: 1, loop, phase: 'day', deck: starterDeck.slice(), money: 0, clues: [], suspected: [], rewardOptions: [], lastNight: null, seed };
}

/** 같은 회차·같은 날이면 같은 밤이 나온다 */
export function nightSeed(run: RunState): number {
  return (run.seed + run.day * 7919 + run.loop * 104729) >>> 0;
}

export function toggleSuspect(run: RunState, ruleNo: number): RunState {
  const suspected = run.suspected.includes(ruleNo) ? run.suspected.filter((n) => n !== ruleNo) : [...run.suspected, ruleNo].sort((a, b) => a - b);
  return { ...run, suspected };
}

export function settleNight(run: RunState, night: NightDef, result: NightState, rewardPool: string[], lastDay: number): RunState {
  if (result.outcome === 'playing') return run;
  if (result.outcome === 'failed') {
    return { ...run, phase: 'failed', lastNight: { day: run.day, pay: 0, resolved: result.resolved.length, newClues: [] } };
  }
  const newClues = night.anomalies
    .filter((a) => a.clue && result.resolved.includes(a.id) && !run.clues.includes(a.clue))
    .map((a) => a.clue!);
  const pay = PAY.base + PAY.perResolved * result.resolved.length;
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

/** 실패 후 다시 출근. 회차가 오르고 1일차부터. (단서 유지는 M3 회차 구조에서) */
export function restartRun(run: RunState, starterDeck: string[]): RunState {
  return newRun(starterDeck, run.seed, run.loop + 1);
}

function pickDistinct(pool: string[], count: number, seed: number): string[] {
  const [, s] = nextRandom(seed);
  return shuffle(pool, s)[0].slice(0, Math.min(count, pool.length));
}
