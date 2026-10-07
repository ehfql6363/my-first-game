import { describe, expect, it } from 'vitest';
import { newRun, type RunState } from './run';
import { parseRun, serializeRun } from './save';

const CARDS = new Set(['light', 'lock']);
const CLUES = new Set(['nametag']);
const ITEMS = new Set(['popcorn', 'haru']);
const RELICS = new Set(['popcorn']);
const parse = (raw: string | null) => parseRun(raw, CARDS, CLUES, ITEMS, RELICS);
const valid: RunState = { ...newRun(['light', 'lock'], 42), day: 2, money: 95, clues: ['nametag'], suspected: [7], owned: ['popcorn', 'haru'], equipped: ['popcorn'], pity: 12, draws: 20 };

describe('저장 데이터', () => {
  it('저장한 그대로 불러온다', () => {
    expect(parse(serializeRun(valid))).toEqual(valid);
  });

  it.each([
    ['빈 값', null],
    ['깨진 JSON', '{"version":1,'],
    ['모르는 버전', JSON.stringify({ ...valid, version: 9 })],
    ['모르는 엔딩', JSON.stringify({ ...valid, endings: ['secret'] })],
    ['음수 빚', JSON.stringify({ ...valid, debt: -1 })],
    ['모르는 캡슐 아이템', JSON.stringify({ ...valid, owned: ['popcorn', 'gold-everything'] })],
    ['갖지 않은 기념품 장착', JSON.stringify({ ...valid, equipped: ['popcorn'], owned: ['haru'] })],
    ['기념품이 아닌 것 장착', JSON.stringify({ ...valid, equipped: ['haru'] })],
    ['같은 기념품 두 번 장착', JSON.stringify({ ...valid, equipped: ['popcorn', 'popcorn'] })],
    ['범위 밖 천장 카운트', JSON.stringify({ ...valid, pity: -3 })],
    ['없는 카드', JSON.stringify({ ...valid, deck: ['light', 'god-mode'] })],
    ['빈 덱', JSON.stringify({ ...valid, deck: [] })],
    ['음수 수당', JSON.stringify({ ...valid, money: -1 })],
    ['소수 날짜', JSON.stringify({ ...valid, day: 1.5 })],
    ['범위 밖 날짜', JSON.stringify({ ...valid, day: 99 })],
    ['모르는 단계', JSON.stringify({ ...valid, phase: 'win' })],
    ['모르는 단서', JSON.stringify({ ...valid, clues: ['<img onerror=x>'] })],
    ['너무 긴 데이터', 'x'.repeat(30_000)],
    ['배열', '[]'],
  ])('%s는 거부한다', (_, raw) => {
    expect(parse(raw as string | null)).toBeNull();
  });

  it('M2(버전 1) 저장은 캡슐 기계·빚·엔딩 항목을 비운 채 불러온다', () => {
    const { owned: _o, equipped: _e, pity: _p, draws: _d, debt: _b, endings: _n, lastEnding: _l, ...rest } = valid;
    const v1 = JSON.stringify({ ...rest, version: 1 });
    expect(parse(v1)).toEqual({ ...valid, owned: [], equipped: [], pity: 0, draws: 0 });
  });

  it('M3(버전 2)의 체험판 끝 저장은 3일차로 이어지는 보상 단계로 바뀐다', () => {
    const { debt: _b, endings: _n, lastEnding: _l, ...rest } = valid;
    const v2 = JSON.stringify({ ...rest, version: 2, phase: 'demo-end', rewardOptions: ['light'] });
    expect(parse(v2)).toMatchObject({ version: 3, phase: 'reward', rewardOptions: [], debt: 0, endings: [] });
  });
});
