import { describe, expect, it } from 'vitest';
import { chooseReward, newRun, nightSeed, PAY, restartRun, settleNight, toggleSuspect } from './run';
import type { NightDef, NightState } from './types';

const NIGHT: NightDef = {
  id: 't', day: 1, minutesPerTurn: 40, startTurn: 0, endTurn: 9, cameras: [{ id: 'gate', name: '정문' }], rules: [],
  anomalies: [
    { id: 'a', name: 'a', kind: 'smile', cameraId: 'gate', appearsAtTurn: 1, requires: 'light', riskPerTurn: 1 },
    { id: 'taeo', name: 'taeo', kind: 'taeo', cameraId: 'gate', appearsAtTurn: 2, requires: 'lock', riskPerTurn: 0, clue: 'nametag' },
  ],
};
const POOL = ['p1', 'p2', 'p3', 'p4', 'p5'];
const result = (outcome: NightState['outcome'], resolved: string[]): NightState => ({
  turn: 9, battery: 3, risk: 0, hand: [], drawPile: [], discard: [], resolved, revealed: false, outcome, seed: 1,
});

describe('회차 진행', () => {
  it('생존하면 수당과 보상 후보 3장을 받고, 거짓 수칙을 간파했으면 단서를 얻는다', () => {
    const run = settleNight(newRun(['x'], 5), NIGHT, result('survived', ['a', 'taeo']), POOL, 7);
    expect(run.phase).toBe('reward');
    expect(run.money).toBe(PAY.base + PAY.perResolved * 2);
    expect(run.clues).toEqual(['nametag']);
    expect(new Set(run.rewardOptions).size).toBe(3);
    expect(run.rewardOptions.every((c) => POOL.includes(c))).toBe(true);
  });

  it('보상을 고르면 덱에 추가되고 다음 날 낮이 된다. 후보에 없는 카드는 무시', () => {
    const r = settleNight(newRun(['x'], 5), NIGHT, result('survived', []), POOL, 7);
    expect(chooseReward(r, 'not-offered')).toBe(r);
    const next = chooseReward(r, r.rewardOptions[0]);
    expect(next.deck).toEqual(['x', r.rewardOptions[0]]);
    expect(next.day).toBe(2);
    expect(next.phase).toBe('day');
    expect(chooseReward(r, null).deck).toEqual(['x']);
  });

  it('마지막 날을 넘기면 체험판 끝', () => {
    const run = settleNight({ ...newRun(['x'], 5), day: 2 }, NIGHT, result('survived', []), POOL, 2);
    expect(run.phase).toBe('demo-end');
  });

  it('실패하면 failed, 다시 출근하면 회차가 오르고 1일차 시작 덱으로', () => {
    const failed = settleNight({ ...newRun(['x'], 5), day: 2, deck: ['x', 'y'] }, NIGHT, result('failed', []), POOL, 7);
    expect(failed.phase).toBe('failed');
    const again = restartRun(failed, ['x']);
    expect(again).toMatchObject({ day: 1, loop: 2, deck: ['x'], phase: 'day' });
    expect(nightSeed(again)).not.toBe(nightSeed(newRun(['x'], 5)));
  });

  it('의심 표시는 켜고 끌 수 있다', () => {
    const r = toggleSuspect(toggleSuspect(newRun(['x'], 1), 7), 3);
    expect(r.suspected).toEqual([3, 7]);
    expect(toggleSuspect(r, 7).suspected).toEqual([3]);
  });
});
