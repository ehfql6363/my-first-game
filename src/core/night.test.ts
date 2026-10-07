import { describe, expect, it } from 'vitest';
import { activeAnomalies, clockText, createNight, endTurn, expiredAt, playCard } from './night';
import { combineMods, type CardDef } from './types';
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

  it('만능 카드(any)는 그 카메라의 어떤 이상 현상이든 해결한다', () => {
    const cards: Record<string, CardDef> = { ...CARDS, whistle: { id: 'whistle', name: '호루라기', cost: 2, kind: 'gear', response: 'any', desc: '' } };
    const s = withHand(createNight(NIGHT, Array(10).fill('lock'), 1), ['whistle']);
    const r = playCard(NIGHT, cards, s, 0, 'cam');
    expect(r.ok && r.resolvedAnomaly?.id).toBe('smile');
  });

  it('배터리 회복 카드는 비용을 내고 배터리를 얻는다', () => {
    const cards: Record<string, CardDef> = { ...CARDS, coffee: { id: 'coffee', name: '커피', cost: 0, kind: 'gear', gainBattery: 1, desc: '' } };
    const s = withHand(createNight(NIGHT, Array(10).fill('lock'), 1), ['coffee']);
    const r = playCard(NIGHT, cards, s, 0, 'cam');
    expect(r.ok && r.state.battery).toBe(NIGHT_RULES.batteryPerTurn + 1);
  });

  it('기한이 있는 이상 현상은 그 턴에 사라지고, 사라지기 전까지만 위험도를 올린다', () => {
    const night: NightDef = { ...NIGHT, endTurn: 9, anomalies: [{ ...NIGHT.anomalies[0], expiresAtTurn: 2, riskPerTurn: 1 }] };
    let s = createNight(night, Array(10).fill('lock'), 1);
    s = endTurn(night, s);
    s = endTurn(night, s);
    expect(activeAnomalies(night, s)).toEqual([]);
    expect(expiredAt(night, s).map((a) => a.id)).toEqual(['smile']);
    expect(endTurn(night, s).risk).toBe(2);
  });

  it('기념품 보정치: 손패·배터리·최대 위험도·시작 위험도·저주 카드가 반영된다', () => {
    const mods = combineMods([{ handSize: -1, firstTurnBattery: 2, maxRisk: 3, startRisk: 1, curses: 2 }, { batteryPerTurn: 1 }]);
    const s = createNight(NIGHT, Array(10).fill('lock'), 1, mods);
    expect(s.hand).toHaveLength(NIGHT_RULES.handSize - 1);
    expect(s.battery).toBe(NIGHT_RULES.batteryPerTurn + 1 + 2);
    expect(s.risk).toBe(1);
    expect([...s.hand, ...s.drawPile].filter((c) => c === 'laughter')).toHaveLength(2);
    const next = endTurn(NIGHT, s);
    expect(next.battery).toBe(NIGHT_RULES.batteryPerTurn + 1);
    expect(endTurn(NIGHT, { ...s, risk: NIGHT_RULES.maxRisk }).outcome).toBe('playing');
  });

  it('동료 카드: 어느 카메라에서든(anyCamera), 한 번에 전부(resolveAll) 대응', () => {
    const two: NightDef = { ...NIGHT, anomalies: [NIGHT.anomalies[0], { ...NIGHT.anomalies[0], id: 'smile2' }] };
    const cards: Record<string, CardDef> = {
      ...CARDS,
      haru: { id: 'haru', name: '같은 편인 척', cost: 1, kind: 'ally', response: 'light', anyCamera: true, desc: '' },
      patrol: { id: 'patrol', name: '대신 순찰', cost: 2, kind: 'ally', response: 'any', resolveAll: true, desc: '' },
    };
    const s = withHand(createNight(two, Array(10).fill('lock'), 1), ['haru', 'patrol']);
    const far = playCard(two, cards, s, 0, 'somewhere-else');
    expect(far.ok && far.resolvedAnomaly?.id).toBe('smile');
    const all = playCard(two, cards, s, 1, 'cam');
    expect(all.ok && all.resolvedCount).toBe(2);
  });

  it('"보지 마십시오": 그 카메라를 보며 턴을 끝낼 때만 위험도가 오르고, 카드로는 사라지지 않는다', () => {
    const night: NightDef = { ...NIGHT, anomalies: [{ id: 'mirror', name: '거울', kind: 'mirror', cameraId: 'cam', appearsAtTurn: 0, requires: 'any', riskPerTurn: 2, gaze: true }] };
    const s = createNight(night, Array(10).fill('lock'), 1);
    expect(endTurn(night, s, 'cam').risk).toBe(2);
    expect(endTurn(night, s, 'other').risk).toBe(0);
    const cards: Record<string, CardDef> = { ...CARDS, whistle: { id: 'whistle', name: '호루라기', cost: 2, kind: 'gear', response: 'any', desc: '' } };
    const r = playCard(night, cards, withHand(s, ['whistle']), 0, 'cam');
    expect(r.ok && r.resolvedAnomaly).toBeUndefined();
  });

  it('기한이 지나 사라질 때 효과(다음 턴 배터리, 문루 빚)가 생긴다', () => {
    const night: NightDef = { ...NIGHT, endTurn: 9, anomalies: [{ id: 'offer', name: '문루의 배터리', kind: 'offer', cameraId: 'cam', appearsAtTurn: 0, expiresAtTurn: 1, requires: 'lock', riskPerTurn: 0, onExpire: { battery: 2, debt: 1 } }] };
    const s = endTurn(night, createNight(night, Array(10).fill('light'), 1));
    expect(s.battery).toBe(NIGHT_RULES.batteryPerTurn + 2);
    expect(s.debt).toBe(1);
  });

  it('카메라 확대로 읽어야 하는 이상 현상(requires zoom)은 확대로 해결되고, 모든 카메라도 드러난다', () => {
    const night: NightDef = { ...NIGHT, anomalies: [{ id: 'wall', name: '벽의 이름', kind: 'wall', cameraId: 'cam', appearsAtTurn: 0, requires: 'zoom', riskPerTurn: 0, clue: 'own-name' }] };
    const r = playCard(night, CARDS, withHand(createNight(night, Array(10).fill('lock'), 1), ['zoom']), 0, 'cam');
    expect(r.ok && r.resolvedAnomaly?.id).toBe('wall');
    expect(r.ok && r.state.revealed).toBe(true);
  });

  it('동료 카드 효과: 저주 카드 태우기, 위험도 회복, 카드 더 뽑기', () => {
    const cards: Record<string, CardDef> = {
      ...CARDS,
      salt: { id: 'salt', name: '소금', cost: 1, kind: 'ally', purgeCurses: true, desc: '' },
      aid: { id: 'aid', name: '응급 처치', cost: 1, kind: 'ally', healRisk: 2, desc: '' },
      trick: { id: 'trick', name: '마술', cost: 1, kind: 'ally', draw: 2, desc: '' },
    };
    const base = createNight(NIGHT, Array(10).fill('lock'), 1);
    const purged = playCard(NIGHT, cards, withHand(base, ['salt', 'laughter', 'lock', 'laughter']), 0, 'cam');
    expect(purged.ok && purged.state.hand).toEqual(['lock']);
    expect(purged.ok && [...purged.state.discard, ...purged.state.drawPile].includes('laughter')).toBe(false);
    const healed = playCard(NIGHT, cards, { ...withHand(base, ['aid']), risk: 3 }, 0, 'cam');
    expect(healed.ok && healed.state.risk).toBe(1);
    const drew = playCard(NIGHT, cards, withHand(base, ['trick']), 0, 'cam');
    expect(drew.ok && drew.state.hand).toHaveLength(2);
  });
});
