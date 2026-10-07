// 한 회차(7일) 진행. 밤 사이의 상태(덱, 수당, 단서)를 관리한다.

import { drawCapsule, type GachaItem, type GachaTable } from './gacha';
import { CURSE_CARD } from './night';
import { nextRandom, shuffle } from './rng';
import type { NightDef, NightState } from './types';

/** finale = 마지막 밤을 버티고 엔딩을 고르는 중, ending = 엔딩을 본 뒤 */
export type RunPhase = 'day' | 'reward' | 'failed' | 'finale' | 'ending';
export type EndingId = 'regular' | 'resign' | 'closing';
export const ENDINGS: EndingId[] = ['regular', 'resign', 'closing'];

export interface RunState {
  version: 3;
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
  lastNight: { day: number; pay: number; resolved: number; newClues: string[]; debt: number } | null;
  seed: number;
  /** 이번 회차의 문루 빚 (문루에게 받은 만큼 저주 카드가 덱에 섞인다) */
  debt: number;
  /** 방금 본 엔딩 */
  lastEnding: EndingId | null;
  // ── 여기부터는 회차가 바뀌어도 남는다 ──
  /** 캡슐 기계에서 얻은 것 (카드 아이템은 여러 번 가질 수 있음) */
  owned: string[];
  /** 장착한 기념품 (최대 RELIC_SLOTS) */
  equipped: string[];
  /** 마지막 금색 이후 뽑은 횟수 (천장) */
  pity: number;
  /** 지금까지 뽑은 횟수 (뽑기 시드용) */
  draws: number;
  /** 본 적 있는 엔딩 */
  endings: EndingId[];
}

export const RELIC_SLOTS = 2;

/** 회차가 바뀌어도 남는 것: 수당, 단서, 캡슐 기계에서 얻은 것, 장착, 천장 카운트 */
type Carry = Pick<RunState, 'money' | 'clues' | 'owned' | 'equipped' | 'pity' | 'draws' | 'endings'>;
const EMPTY_CARRY: Carry = { money: 0, clues: [], owned: [], equipped: [], pity: 0, draws: 0, endings: [] };

export const PAY = { base: 50, perResolved: 15 } as const;

/** items = 카드를 주는 아이템 목록 (캡슐 기계 + 스토리로 얻는 동료) */
export function newRun(starterDeck: string[], seed: number, loop = 1, carry: Carry = EMPTY_CARRY, items: GachaItem[] = []): RunState {
  return {
    version: 3,
    day: 1,
    loop,
    phase: 'day',
    deck: startingDeck(starterDeck, carry.owned, items),
    suspected: [],
    rewardOptions: [],
    lastNight: null,
    seed,
    debt: 0,
    lastEnding: null,
    ...carry,
  };
}

/** 회차 시작 덱 = 기본 덱 + 얻은 아이템이 주는 카드 */
export function startingDeck(starterDeck: string[], owned: string[], items: GachaItem[] = []): string[] {
  const granted = owned.map((id) => items.find((i) => i.id === id)?.grantsCard).filter((c): c is string => !!c);
  return [...starterDeck, ...granted];
}

/** 다시 출근한 회차에서 수칙서에 나타나는 '내 글씨' 메모 */
export function visibleLoopMemos(night: NightDef, run: Pick<RunState, 'loop' | 'clues'>): string[] {
  return (night.loopMemos ?? []).filter((m) => run.loop >= m.minLoop && (!m.clue || run.clues.includes(m.clue))).map((m) => m.text);
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
    return { ...run, phase: 'failed', lastNight: { day: run.day, pay: 0, resolved: result.resolved.length, newClues: [], debt: 0 } };
  }
  const newClues = night.anomalies
    .filter((a) => a.clue && result.resolved.includes(a.id) && !run.clues.includes(a.clue))
    .map((a) => a.clue!);
  const pay = Math.round((PAY.base + PAY.perResolved * result.resolved.length) * (1 + payBonus));
  const options = pickDistinct(rewardPool, 3, run.seed + run.day * 31 + run.loop);
  return {
    ...run,
    phase: run.day >= lastDay ? 'finale' : 'reward',
    money: run.money + pay,
    clues: [...run.clues, ...newClues],
    rewardOptions: options,
    debt: run.debt + result.debt,
    deck: [...run.deck, ...Array<string>(result.debt).fill(CURSE_CARD)],
    lastNight: { day: run.day, pay, resolved: result.resolved.length, newClues, debt: result.debt },
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
export function restartRun(run: RunState, starterDeck: string[], items: GachaItem[] = []): RunState {
  const { money, clues, owned, equipped, pity, draws, endings } = run;
  return newRun(starterDeck, run.seed, run.loop + 1, { money, clues, owned, equipped, pity, draws, endings }, items);
}

/** 스토리로 얻는 동료(가챠가 아님). 이미 있으면 그대로 */
export function grantStoryItem(run: RunState, item: GachaItem): RunState {
  if (run.owned.includes(item.id)) return run;
  return { ...run, owned: [...run.owned, item.id], deck: item.grantsCard ? [...run.deck, item.grantsCard] : run.deck };
}

/** 낮 대화의 선택 등으로 얻는 단서 */
export function addClue(run: RunState, clue: string): RunState {
  return run.clues.includes(clue) ? run : { ...run, clues: [...run.clues, clue] };
}

/**
 * 마지막 밤 뒤의 선택.
 * closing(폐장)은 자기 이름을 알고(own-name 단서), 필요한 동료를 모두 구출했을 때만 고를 수 있다.
 */
export function canChoose(run: RunState, ending: EndingId, required: { clue: string; owned: string[] }): boolean {
  if (run.phase !== 'finale') return false;
  if (ending !== 'closing') return true;
  return run.clues.includes(required.clue) && required.owned.every((id) => run.owned.includes(id));
}

export function chooseEnding(run: RunState, ending: EndingId, required: { clue: string; owned: string[] }): RunState {
  if (!canChoose(run, ending, required)) return run;
  return { ...run, phase: 'ending', lastEnding: ending, endings: run.endings.includes(ending) ? run.endings : [...run.endings, ending] };
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
