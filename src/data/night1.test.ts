import { describe, expect, it } from 'vitest';
import { activeAnomalies, createNight, endTurn, playCard } from '../core/night';
import type { NightDef, NightState } from '../core/types';
import { CARDS, STARTER_DECK } from './cards';
import { NIGHT_1 } from './night1';

// 수칙대로 성실히 대응하는 플레이어 흉내. 밸런스 확인용.
function playDiligently(night: NightDef, seed: number): NightState {
  let s = createNight(night, STARTER_DECK, seed);
  while (s.outcome === 'playing') {
    for (const a of activeAnomalies(night, s)) {
      const idx = s.hand.findIndex((id) => CARDS[id].response === a.requires);
      if (idx < 0) continue;
      const r = playCard(night, CARDS, s, idx, a.cameraId);
      if (r.ok) s = r.state;
    }
    s = endTurn(night, s);
  }
  return s;
}

function idle(night: NightDef, seed: number): NightState {
  let s = createNight(night, STARTER_DECK, seed);
  while (s.outcome === 'playing') s = endTurn(night, s);
  return s;
}

describe('1일차 밸런스', () => {
  it('모든 이상 현상은 존재하는 카메라에 나타나고 근무 시간 안에 나온다', () => {
    const cams = new Set(NIGHT_1.cameras.map((c) => c.id));
    for (const a of NIGHT_1.anomalies) {
      expect(cams.has(a.cameraId)).toBe(true);
      expect(a.appearsAtTurn).toBeLessThan(NIGHT_1.endTurn);
    }
  });

  it('이상 현상 id는 겹치지 않는다', () => {
    const ids = NIGHT_1.anomalies.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('아무것도 하지 않으면 살아남을 수 없다', () => {
    for (let seed = 1; seed <= 20; seed++) expect(idle(NIGHT_1, seed).outcome).toBe('failed');
  });

  it('수칙대로 대응하면 거의 항상 살아남는다 (튜토리얼 밤)', () => {
    let survived = 0;
    for (let seed = 1; seed <= 200; seed++) if (playDiligently(NIGHT_1, seed).outcome === 'survived') survived++;
    expect(survived / 200).toBeGreaterThanOrEqual(0.95);
  });
});
