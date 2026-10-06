import { describe, expect, it } from 'vitest';
import type { GachaTable } from './gacha';
import { chooseReward, newRun, nightSeed, PAY, pullCapsule, RELIC_SLOTS, restartRun, settleNight, toggleEquip, toggleSuspect } from './run';
import { NO_MODS, type NightDef, type NightState } from './types';

const NIGHT: NightDef = {
  id: 't', day: 1, minutesPerTurn: 40, startTurn: 0, endTurn: 9, cameras: [{ id: 'gate', name: '정문' }], rules: [],
  anomalies: [
    { id: 'a', name: 'a', kind: 'smile', cameraId: 'gate', appearsAtTurn: 1, requires: 'light', riskPerTurn: 1 },
    { id: 'taeo', name: 'taeo', kind: 'taeo', cameraId: 'gate', appearsAtTurn: 2, requires: 'lock', riskPerTurn: 0, clue: 'nametag' },
  ],
};
const POOL = ['p1', 'p2', 'p3', 'p4', 'p5'];
const result = (outcome: NightState['outcome'], resolved: string[]): NightState => ({
  turn: 9, battery: 3, risk: 0, hand: [], drawPile: [], discard: [], resolved, revealed: false, outcome, seed: 1, mods: NO_MODS,
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

  it('수당 보너스(기념품)는 수당에 곱해진다', () => {
    const run = settleNight(newRun(['x'], 5), NIGHT, result('survived', ['a']), POOL, 7, 0.2);
    expect(run.money).toBe(Math.round((PAY.base + PAY.perResolved) * 1.2));
  });
});

const TABLE: GachaTable = {
  cost: 100, pity: 3, duplicateRefund: 40,
  rates: { white: 1, blue: 0, purple: 0, gold: 0 },
  items: [
    { id: 'relic', name: '기념품', grade: 'white', kind: 'relic' },
    { id: 'buddy', name: '동료', grade: 'gold', kind: 'companion', grantsCard: 'buddy-card' },
  ],
};

describe('캡슐 기계와 회차', () => {
  it('수당이 모자라면 뽑을 수 없다', () => {
    expect(pullCapsule({ ...newRun(['x'], 1), money: 99 }, TABLE)).toBeNull();
  });

  it('뽑으면 수당이 줄고, 중복이면 일부 돌려받는다', () => {
    const first = pullCapsule({ ...newRun(['x'], 1), money: 300 }, TABLE)!;
    expect(first.item.id).toBe('relic');
    expect(first.run.money).toBe(200);
    const second = pullCapsule(first.run, TABLE)!;
    expect(second.duplicate).toBe(true);
    expect(second.run.money).toBe(140);
    expect(second.run.owned).toEqual(['relic']);
  });

  it('천장에 닿으면 금색 동료가 나오고, 동료 카드가 지금 덱에 바로 들어간다', () => {
    let run = { ...newRun(['x'], 1), money: 1000 };
    const got: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = pullCapsule(run, TABLE)!;
      run = r.run;
      got.push(r.item.id);
    }
    expect(got[2]).toBe('buddy');
    expect(run.deck).toContain('buddy-card');
    expect(run.pity).toBe(0);
  });

  it('기념품 장착은 가진 것만, 최대 칸 수까지', () => {
    let run = { ...newRun(['x'], 1), owned: ['r1', 'r2', 'r3'] };
    expect(toggleEquip(run, 'nope').equipped).toEqual([]);
    for (const r of ['r1', 'r2', 'r3']) run = toggleEquip(run, r);
    expect(run.equipped).toHaveLength(RELIC_SLOTS);
    expect(toggleEquip(run, 'r1').equipped).toEqual(['r2']);
  });

  it('실패 후 재출근해도 수당·단서·얻은 것·장착·천장은 남고, 동료 카드는 시작 덱에 포함된다', () => {
    const run = { ...newRun(['x'], 1), day: 2, money: 77, clues: ['nametag'], owned: ['relic', 'buddy'], equipped: ['relic'], pity: 2, draws: 9, deck: ['x', 'reward'] };
    const again = restartRun(run, ['x'], TABLE);
    expect(again).toMatchObject({ day: 1, loop: 2, money: 77, clues: ['nametag'], owned: ['relic', 'buddy'], equipped: ['relic'], pity: 2, draws: 9 });
    expect(again.deck).toEqual(['x', 'buddy-card']);
  });
});
