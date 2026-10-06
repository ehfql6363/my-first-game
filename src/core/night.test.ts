import { describe, expect, it } from 'vitest';
import { activeAnomalies, clockText, createNight, endTurn, playCard } from './night';
import { NIGHT_RULES, type NightDef, type NightState } from './types';
import { CARDS } from '../data/cards';

const NIGHT: NightDef = {
  id: 'test',
  day: 1,
  minutesPerTurn: 20,
  startTurn: 0,
  endTurn: 3,
  cameras: [{ id: 'cam', name: '테스트' }],
  anomalies: [{ id: 'smile', name: '웃는 문루', kind: 'smile', cameraId: 'cam', appearsAtTurn: 0, requires: 'light', riskPerTurn: 2 }],
  rules: [],
};

function withHand(state: NightState, hand: string[]): NightState {
  return { ...state, hand };
}

describe('밤 경비실', () => {
  it('시작하면 카드 5장과 배터리 3을 받는다', () => {
    const s = createNight(NIGHT, Array(10).fill('light'), 1);
    expect(s.hand).toHaveLength(NIGHT_RULES.handSize);
    expect(s.battery).toBe(NIGHT_RULES.batteryPerTurn);
  });

  it('같은 시드면 같은 손패가 나온다', () => {
    const deck = ['light', 'lock', 'ignore', 'zoom', 'light', 'lock', 'ignore'];
    expect(createNight(NIGHT, deck, 42).hand).toEqual(createNight(NIGHT, deck, 42).hand);
  });

  it('수칙에 맞는 카드를 맞는 카메라에 쓰면 이상 현상이 해결된다', () => {
    const s = withHand(createNight(NIGHT, Array(10).fill('lock'), 1), ['lock', 'light']);
    const r = playCard(NIGHT, CARDS, s, 1, 'cam');
    expect(r.ok && r.resolvedAnomaly?.id).toBe('smile');
    expect(r.ok && activeAnomalies(NIGHT, r.state)).toEqual([]);
    expect(r.ok && r.state.battery).toBe(2);
  });

  it('틀린 카드나 다른 카메라에는 해결되지 않는다', () => {
    const s = withHand(createNight(NIGHT, Array(10).fill('lock'), 1), ['lock', 'light']);
    const wrongCard = playCard(NIGHT, CARDS, s, 0, 'cam');
    const wrongCam = playCard(NIGHT, CARDS, s, 1, 'elsewhere');
    expect(wrongCard.ok && wrongCard.resolvedAnomaly).toBeUndefined();
    expect(wrongCam.ok && wrongCam.resolvedAnomaly).toBeUndefined();
  });

  it('저주 카드와 배터리가 모자란 카드는 낼 수 없다', () => {
    const s = withHand(createNight(NIGHT, Array(10).fill('lock'), 1), ['laughter', 'light']);
    expect(playCard(NIGHT, CARDS, s, 0, 'cam')).toEqual({ ok: false, reason: 'cursed' });
    expect(playCard(NIGHT, CARDS, { ...s, battery: 0 }, 1, 'cam')).toEqual({ ok: false, reason: 'no-battery' });
  });

  it('대응하지 않은 이상 현상만큼 턴 종료 시 위험도가 오른다', () => {
    const s = endTurn(NIGHT, createNight(NIGHT, Array(10).fill('lock'), 1));
    expect(s.risk).toBe(2);
    expect(s.turn).toBe(1);
    expect(s.hand).toHaveLength(NIGHT_RULES.handSize);
    expect(s.battery).toBe(NIGHT_RULES.batteryPerTurn);
  });

  it('위험도가 최대치에 닿으면 실패한다', () => {
    const s = endTurn(NIGHT, { ...createNight(NIGHT, Array(10).fill('lock'), 1), risk: NIGHT_RULES.maxRisk - 1 });
    expect(s.outcome).toBe('failed');
  });

  it('마지막 턴을 넘기면 생존한다', () => {
    let s = createNight({ ...NIGHT, anomalies: [] }, Array(10).fill('lock'), 1);
    for (let i = 0; i < 3; i++) s = endTurn({ ...NIGHT, anomalies: [] }, s);
    expect(s.outcome).toBe('survived');
  });

  it('카드 총량은 턴이 지나도 그대로다', () => {
    const deck = ['light', 'lock', 'ignore', 'zoom', 'light', 'lock', 'ignore'];
    let s = createNight({ ...NIGHT, endTurn: 99, anomalies: [] }, deck, 7);
    for (let i = 0; i < 5; i++) s = endTurn({ ...NIGHT, endTurn: 99, anomalies: [] }, s);
    expect(s.hand.length + s.drawPile.length + s.discard.length).toBe(deck.length);
  });

  it('카메라 확대는 이번 턴에만 이상 유무를 드러내고, 이상 현상을 해결하지는 않는다', () => {
    const s = withHand(createNight(NIGHT, Array(10).fill('lock'), 1), ['zoom']);
    const r = playCard(NIGHT, CARDS, s, 0, 'cam');
    expect(r.ok && r.state.revealed).toBe(true);
    expect(r.ok && r.resolvedAnomaly).toBeUndefined();
    expect(r.ok && endTurn(NIGHT, r.state).revealed).toBe(false);
  });

  it('시계는 턴과 턴 길이로 계산한다', () => {
    expect(clockText(NIGHT, 0)).toBe('00:00');
    expect(clockText(NIGHT, 8)).toBe('02:40');
    expect(clockText(NIGHT, 18)).toBe('06:00');
  });
});
