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
  // ── 확장 기념품 (2026-10-07) ──
  tickets: {
    id: 'tickets', name: '낡은 입장권 다발', grade: 'white',
    good: '근무 수당 +15%', curse: '첫 턴 배터리 -1',
    story: '날짜가 전부 같다. 10년 전 그날.',
    effect: { payBonus: 0.15, firstTurnBattery: -1 },
  },
  'lost-shoe': {
    id: 'lost-shoe', name: '한 짝뿐인 운동화', grade: 'white',
    good: '첫 턴 카드 1장 더', curse: '덱에 웃음소리 1장',
    story: '아이 신발. 나머지 한 짝은 회전목마 위에 있다고 들었다.',
    effect: { firstTurnHand: 1, curses: 1 },
  },
  'photo-keyring': {
    id: 'photo-keyring', name: '기념사진 열쇠고리', grade: 'blue',
    good: '첫 턴 모든 카메라 이상 유무 공개', curse: '근무 수당 -10%',
    story: '사진 속 가족 뒤에 문루가 서 있다. 사진마다.',
    effect: { startRevealed: true, payBonus: -0.1 },
  },
  'moonroo-mask': {
    id: 'moonroo-mask', name: '문루 가면', grade: 'blue',
    good: '최대 위험도 +2', curse: '첫 턴 카드 1장 적게',
    story: '안쪽이 따뜻하다. 방금 누가 벗은 것처럼.',
    effect: { maxRisk: 2, firstTurnHand: -1 },
  },
  'parade-drum': {
    id: 'parade-drum', name: '퍼레이드 북', grade: 'purple',
    good: '손패 1장 더', curse: '위험도 2에서 시작',
    story: '아무도 치지 않는데 박자가 맞다.',
    effect: { handSize: 1, startRisk: 2 },
  },
  'staff-badge': {
    id: 'staff-badge', name: '빈 직원 명찰', grade: 'purple',
    good: '매 턴 배터리 +1', curse: '덱에 웃음소리 2장',
    story: '이름 칸이 비어 있다. 볼펜으로 쓰려 하면 잉크가 안 나온다.',
    effect: { batteryPerTurn: 1, curses: 2 },
  },
  'golden-invite': {
    id: 'golden-invite', name: '금빛 초대장', grade: 'gold',
    good: '손패 1장 더 · 매 턴 배터리 +1', curse: '최대 위험도 -3',
    story: '"정규직 전환 심사에 초대합니다." 받는 사람 칸에 이미 이름이 적혀 있다.',
    effect: { handSize: 1, batteryPerTurn: 1, maxRisk: -3 },
  },
  'moon-pin': {
    id: 'moon-pin', name: '달 모양 배지', grade: 'gold',
    good: '최대 위험도 +4 · 첫 턴 모든 카메라 공개', curse: '덱에 웃음소리 3장',
    story: '첫 번째 야간 퍼레이드 직원에게만 나눠 준 배지. 하나가 모자랐다고 한다.',
    effect: { maxRisk: 4, startRevealed: true, curses: 3 },
  },
};
