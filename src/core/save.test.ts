import { describe, expect, it } from 'vitest';
import { newRun, type RunState } from './run';
import { parseRun, serializeRun } from './save';

const CARDS = new Set(['light', 'lock']);
const CLUES = new Set(['nametag']);
const valid: RunState = { ...newRun(['light', 'lock'], 42), day: 2, money: 95, clues: ['nametag'], suspected: [7] };

describe('저장 데이터', () => {
  it('저장한 그대로 불러온다', () => {
    expect(parseRun(serializeRun(valid), CARDS, CLUES)).toEqual(valid);
  });

  it.each([
    ['빈 값', null],
    ['깨진 JSON', '{"version":1,'],
    ['다른 버전', JSON.stringify({ ...valid, version: 2 })],
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
    expect(parseRun(raw as string | null, CARDS, CLUES)).toBeNull();
  });
});
