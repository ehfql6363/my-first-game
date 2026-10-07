// 밤 경비실 턴 진행. 모든 함수는 이전 상태를 바꾸지 않고 새 상태를 돌려준다.

import { shuffle } from './rng';
import { NIGHT_RULES, NO_MODS, type AnomalyDef, type CardDef, type NightDef, type NightMods, type NightState } from './types';

export type PlayResult =
  | { ok: true; state: NightState; resolvedAnomaly?: AnomalyDef; resolvedCount?: number }
  | { ok: false; reason: 'not-playing' | 'cursed' | 'no-battery' | 'bad-index' };

/** 저주 카드 id. 기념품 저주로 덱에 섞인다 */
export const CURSE_CARD = 'laughter';

export function maxRisk(state: NightState): number {
  return NIGHT_RULES.maxRisk + state.mods.maxRisk;
}
export function batteryPerTurn(state: NightState): number {
  return Math.max(1, NIGHT_RULES.batteryPerTurn + state.mods.batteryPerTurn);
}
function handSize(mods: NightMods): number {
  return Math.max(1, NIGHT_RULES.handSize + mods.handSize);
}

export function createNight(night: NightDef, deck: string[], seed: number, mods: NightMods = NO_MODS): NightState {
  const full = [...deck, ...Array<string>(mods.curses).fill(CURSE_CARD)];
  const [drawPile, nextSeed] = shuffle(full, seed);
  const base: NightState = {
    turn: night.startTurn,
    battery: Math.max(0, NIGHT_RULES.batteryPerTurn + mods.batteryPerTurn + mods.firstTurnBattery),
    risk: mods.startRisk,
    hand: [],
    drawPile,
    discard: [],
    resolved: [],
    revealed: mods.startRevealed,
    debt: 0,
    outcome: 'playing',
    seed: nextSeed,
    mods,
  };
  return draw(base, Math.max(1, handSize(mods) + mods.firstTurnHand));
}

/** 지금 카메라에 떠 있고 아직 대응하지 않은 이상 현상 */
export function activeAnomalies(night: NightDef, state: NightState): AnomalyDef[] {
  return night.anomalies.filter(
    (a) =>
      a.appearsAtTurn <= state.turn &&
      (a.expiresAtTurn === undefined || state.turn < a.expiresAtTurn) &&
      !state.resolved.includes(a.id),
  );
}

export function playCard(
  night: NightDef,
  cards: Record<string, CardDef>,
  state: NightState,
  handIndex: number,
  cameraId: string,
): PlayResult {
  if (state.outcome !== 'playing') return { ok: false, reason: 'not-playing' };
  const cardId = state.hand[handIndex];
  if (cardId === undefined) return { ok: false, reason: 'bad-index' };
  const card = cards[cardId];
  if (card.cost === null) return { ok: false, reason: 'cursed' };
  if (card.cost > state.battery) return { ok: false, reason: 'no-battery' };

  const hand = state.hand.filter((_, i) => i !== handIndex);
  let next: NightState = {
    ...state,
    hand,
    battery: state.battery - card.cost + (card.gainBattery ?? 0),
    discard: [...state.discard, cardId],
  };

  const matches = card.response
    ? activeAnomalies(night, state).filter(
        (a) => (card.anyCamera || a.cameraId === cameraId) && (card.response === 'any' || a.requires === card.response),
      )
    : [];
  const targets = (card.resolveAll ? matches : matches.slice(0, 1)).filter((a) => !a.gaze);
  if (targets.length) next = { ...next, resolved: [...next.resolved, ...targets.map((a) => a.id)] };
  // 카메라 확대는 대응(확대로 읽어야 하는 단서)과 별개로 이번 턴 모든 카메라를 드러낸다
  if (card.response === 'zoom') next = { ...next, revealed: true };
  return { ok: true, state: next, resolvedAnomaly: targets[0], resolvedCount: targets.length };
}

/**
 * 턴 종료. viewedCameraId = 턴을 끝낼 때 보고 있던 카메라 ("보지 마십시오" 판정용).
 */
export function endTurn(night: NightDef, state: NightState, viewedCameraId?: string): NightState {
  if (state.outcome !== 'playing') return state;
  const gained = activeAnomalies(night, state)
    .filter((a) => !a.gaze || a.cameraId === viewedCameraId)
    .reduce((sum, a) => sum + a.riskPerTurn, 0);
  const limit = maxRisk(state);
  const risk = Math.min(limit, state.risk + gained);
  const turn = state.turn + 1;
  const outcome = risk >= limit ? 'failed' : turn >= night.endTurn ? 'survived' : 'playing';

  const lapsed = night.anomalies.filter((a) => a.expiresAtTurn === turn && a.onExpire && !state.resolved.includes(a.id));
  const bonus = lapsed.reduce((s, a) => s + (a.onExpire?.battery ?? 0), 0);
  const debt = lapsed.reduce((s, a) => s + (a.onExpire?.debt ?? 0), 0);

  const next: NightState = {
    ...state,
    turn,
    risk,
    outcome,
    debt: state.debt + debt,
    battery: batteryPerTurn(state) + bonus,
    revealed: false,
    hand: [],
    discard: [...state.discard, ...state.hand],
  };
  return outcome === 'playing' ? draw(next, handSize(state.mods)) : next;
}

/** 게임 속 시각 "HH:MM" */
export function clockText(night: NightDef, turn: number): string {
  const minutes = turn * night.minutesPerTurn;
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** 대응하지 않은 채 이번 턴 시작과 함께 사라진 이상 현상 */
export function expiredAt(night: NightDef, state: NightState): AnomalyDef[] {
  return night.anomalies.filter((a) => a.expiresAtTurn === state.turn && !state.resolved.includes(a.id));
}

function draw(state: NightState, count: number): NightState {
  let { drawPile, discard, seed } = state;
  const hand = state.hand.slice();
  while (hand.length < count) {
    if (drawPile.length === 0) {
      if (discard.length === 0) break;
      [drawPile, seed] = shuffle(discard, seed);
      discard = [];
    }
    hand.push(drawPile[0]);
    drawPile = drawPile.slice(1);
  }
  return { ...state, hand, drawPile, discard, seed };
}
