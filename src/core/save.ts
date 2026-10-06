// 저장 데이터 직렬화와 검증. 저장 데이터는 사용자가 마음대로 고칠 수 있다고 가정한다 (docs/departments/security.md).

import type { RunPhase, RunState } from './run';

const PHASES: RunPhase[] = ['day', 'reward', 'failed', 'demo-end'];
const LIMITS = { maxDay: 7, maxLoop: 9999, maxDeck: 60, maxMoney: 1_000_000, maxClues: 50, maxRule: 20 } as const;

export function serializeRun(run: RunState): string {
  return JSON.stringify(run);
}

/** 형식이나 범위가 하나라도 맞지 않으면 null (조용히 새 게임으로) */
export function parseRun(raw: string | null, knownCards: ReadonlySet<string>, knownClues: ReadonlySet<string>): RunState | null {
  if (!raw || raw.length > 20_000) return null;
  let d: unknown;
  try {
    d = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObj(d) || d.version !== 1) return null;
  const { day, loop, phase, deck, money, clues, suspected, rewardOptions, lastNight, seed } = d;
  if (!isInt(day, 1, LIMITS.maxDay) || !isInt(loop, 1, LIMITS.maxLoop) || !isInt(money, 0, LIMITS.maxMoney) || !isInt(seed, 0, 2 ** 32 - 1)) return null;
  if (typeof phase !== 'string' || !PHASES.includes(phase as RunPhase)) return null;
  if (!isStrList(deck, LIMITS.maxDeck, knownCards) || deck.length === 0) return null;
  if (!isStrList(clues, LIMITS.maxClues, knownClues)) return null;
  if (!isStrList(rewardOptions, 3, knownCards)) return null;
  if (!Array.isArray(suspected) || suspected.length > LIMITS.maxRule || !suspected.every((n) => isInt(n, 1, LIMITS.maxRule))) return null;
  if (lastNight !== null && !isLastNight(lastNight, knownClues)) return null;
  return {
    version: 1,
    day,
    loop,
    phase: phase as RunPhase,
    deck: deck.slice(),
    money,
    clues: clues.slice(),
    suspected: (suspected as number[]).slice(),
    rewardOptions: rewardOptions.slice(),
    lastNight: lastNight as RunState['lastNight'],
    seed,
  };
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
function isInt(v: unknown, min: number, max: number): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;
}
function isStrList(v: unknown, max: number, allowed: ReadonlySet<string>): v is string[] {
  return Array.isArray(v) && v.length <= max && v.every((x) => typeof x === 'string' && allowed.has(x));
}
function isLastNight(v: unknown, knownClues: ReadonlySet<string>): boolean {
  return isObj(v) && isInt(v.day, 1, LIMITS.maxDay) && isInt(v.pay, 0, LIMITS.maxMoney) && isInt(v.resolved, 0, 100) && isStrList(v.newClues, LIMITS.maxClues, knownClues);
}
