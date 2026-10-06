import type { Grade } from '../core/gacha';
import type { NightMods } from '../core/types';

/** 기념품: 효과 + 작은 저주. 손님들이 잃어버린 물건 (docs/planning/gacha-v1.md) */
export interface RelicDef {
  id: string;
  name: string;
  grade: Grade;
  good: string;
  curse: string;
  story: string;
  effect: Partial<NightMods>;
}

export const RELICS: Record<string, RelicDef> = {
  popcorn: {
    id: 'popcorn', name: '팝콘통', grade: 'white',
    good: '근무 수당 +20%', curse: '첫 턴 카드 1장 적게',
    story: '가끔 통 안에서 무언가 씹는 소리가 난다.',
    effect: { payBonus: 0.2, firstTurnHand: -1 },
  },
  cotton: {
    id: 'cotton', name: '솜사탕 막대', grade: 'white',
    good: '최대 위험도 +1', curse: '덱에 웃음소리 1장',
    story: '솜사탕은 없다. 막대가 아직 끈적하다.',
    effect: { maxRisk: 1, curses: 1 },
  },
  'moon-balloon': {
    id: 'moon-balloon', name: '문루 풍선', grade: 'blue',
    good: '첫 턴 배터리 +2', curse: '위험도 1에서 시작',
    story: '바람이 빠지지 않는다. 10년째.',
    effect: { firstTurnBattery: 2, startRisk: 1 },
  },
  snowball: {
    id: 'snowball', name: '눈알 사탕 스노우볼', grade: 'blue',
    good: '첫 턴 모든 카메라 이상 유무 공개', curse: '첫 턴 배터리 -1',
    story: '흔들 때마다 안의 눈알이 이쪽으로 돈다.',
    effect: { startRevealed: true, firstTurnBattery: -1 },
  },
  orgel: {
    id: 'orgel', name: '회전목마 오르골', grade: 'purple',
    good: '최대 위험도 +3', curse: '덱에 웃음소리 2장',
    story: '태엽을 감지 않아도 돈다. 노래는 거꾸로다.',
    effect: { maxRisk: 3, curses: 2 },
  },
  keys: {
    id: 'keys', name: '경비실 열쇠꾸러미', grade: 'purple',
    good: '손패 1장 더', curse: '매 턴 배터리 -1',
    story: '열쇠가 열세 개. 맞는 문은 열두 개.',
    effect: { handSize: 1, batteryPerTurn: -1 },
  },
};
