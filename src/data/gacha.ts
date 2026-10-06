import type { GachaItem, GachaTable } from '../core/gacha';
import { COMPANIONS } from './companions';
import { RELICS } from './relics';

// 캡슐 기계 확률표. 게임 안 "확률 보기"에 이 값이 그대로 나온다 (한국 확률형 아이템 표시 의무).
// 스토리 단서는 여기 넣지 않는다.

const items: GachaItem[] = [
  ...Object.values(RELICS).map((r): GachaItem => ({ id: r.id, name: r.name, grade: r.grade, kind: 'relic' })),
  ...Object.values(COMPANIONS).map((c): GachaItem => ({ id: c.id, name: c.name, grade: c.grade, kind: 'companion', grantsCard: c.card })),
  { id: 'item-coffee', name: '보온병 커피 (카드)', grade: 'white', kind: 'card', grantsCard: 'coffee' },
  { id: 'item-whistle', name: '호루라기 (카드)', grade: 'blue', kind: 'card', grantsCard: 'whistle' },
];

export const GACHA: GachaTable = {
  cost: 100,
  pity: 30,
  rates: { white: 0.55, blue: 0.3, purple: 0.12, gold: 0.03 },
  duplicateRefund: 40,
  items,
};

export const GRADE_LABEL = { white: '흰색 (일반)', blue: '파란색 (희귀)', purple: '보라색 (영웅)', gold: '금색 (전설)' } as const;
export const GRADE_COLOR = { white: '#f4f1ea', blue: '#4f8dff', purple: '#a46bff', gold: '#ffd76a' } as const;
