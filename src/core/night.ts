// 밤 경비실 턴 진행. 모든 함수는 이전 상태를 바꾸지 않고 새 상태를 돌려준다.

import { shuffle } from './rng';
import { NIGHT_RULES, type AnomalyDef, type CardDef, type NightDef, type NightState } from './types';

export type PlayResult =
  | { ok: true; state: NightState; resolvedAnomaly?: AnomalyDef }
  | { ok: false; reason: 'not-playing' | 'cursed' | 'no-battery' | 'bad-index' };

export function createNight(night: NightDef, deck: string[], seed: number): NightState {
  const [drawPile, nextSeed] = shuffle(deck, seed);
  const base: NightState = {
    turn: night.startTurn,
    battery: NIGHT_RULES.batteryPerTurn,
    risk: 0,
    hand: [],
    drawPile,
    discard: [],
    resolved: [],
    revealed: false,
    outcome: 'playing',
    seed: nextSeed,
  };
  return draw(base, NIGHT_RULES.handSize);
}

/** 지금 카메라에 떠 있고 아직 대응하지 않은 이상 현상 */
export function activeAnomalies(night: NightDef, state: NightState): AnomalyDef[] {
  return night.anomalies.filter((a) => a.appearsAtTurn <= state.turn && !state.resolved.includes(a.id));
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
    battery: state.battery - card.cost,
    discard: [...state.discard, cardId],
  };

  if (card.response === 'zoom') return { ok: true, state: { ...next, revealed: true } };

  const target = activeAnomalies(night, state).find(
    (a) => a.cameraId === cameraId && a.requires === card.response,
  );
  if (target) next = { ...next, resolved: [...next.resolved, target.id] };
  return { ok: true, state: next, resolvedAnomaly: target };
}

export function endTurn(night: NightDef, state: NightState): NightState {
  if (state.outcome !== 'playing') return state;
  const gained = activeAnomalies(night, state).reduce((sum, a) => sum + a.riskPerTurn, 0);
  const risk = Math.min(NIGHT_RULES.maxRisk, state.risk + gained);
  const turn = state.turn + 1;
  const outcome = risk >= NIGHT_RULES.maxRisk ? 'failed' : turn >= night.endTurn ? 'survived' : 'playing';

  const next: NightState = {
    ...state,
    turn,
    risk,
    outcome,
    battery: NIGHT_RULES.batteryPerTurn,
    revealed: false,
    hand: [],
    discard: [...state.discard, ...state.hand],
  };
  return outcome === 'playing' ? draw(next, NIGHT_RULES.handSize) : next;
}

/** 게임 속 시각 "HH:MM" */
export function clockText(night: NightDef, turn: number): string {
  const minutes = turn * night.minutesPerTurn;
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
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
