// 캡슐 기계. 확률표와 천장은 데이터(src/data/gacha.ts)에서 오고, 여기서는 계산만 한다.

import { nextRandom } from './rng';

export type Grade = 'white' | 'blue' | 'purple' | 'gold';
export const GRADES: Grade[] = ['white', 'blue', 'purple', 'gold'];

export interface GachaItem {
  id: string;
  name: string;
  grade: Grade;
  kind: 'companion' | 'relic' | 'card';
  /** 얻으면 덱에 들어가는 카드 (동료 전용 카드, 장비 카드) */
  grantsCard?: string;
}

export interface GachaTable {
  cost: number;
  /** 이 횟수 안에 금색이 반드시 나온다 */
  pity: number;
  /** 등급 확률. 합은 1 */
  rates: Record<Grade, number>;
  items: GachaItem[];
  /** 이미 가진 동료·기념품이 또 나오면 돌려주는 수당 */
  duplicateRefund: number;
}

/** 게임 안 확률표에 그대로 보여 줄 아이템별 확률 */
export function itemRates(table: GachaTable): { item: GachaItem; rate: number }[] {
  return table.items.map((item) => {
    const same = table.items.filter((i) => i.grade === item.grade).length;
    return { item, rate: table.rates[item.grade] / same };
  });
}

/**
 * 한 번 뽑기. pityCount = 마지막 금색 이후 뽑은 횟수.
 * 이번 뽑기로 천장에 닿으면 금색 확정.
 */
export function drawCapsule(table: GachaTable, pityCount: number, seed: number): { item: GachaItem; pityCount: number } {
  const [r1, s1] = nextRandom(seed);
  const [r2] = nextRandom(s1);
  let grade: Grade;
  if (pityCount + 1 >= table.pity) grade = 'gold';
  else {
    let acc = 0;
    grade = 'white';
    for (const g of GRADES) {
      acc += table.rates[g];
      if (r1 < acc) {
        grade = g;
        break;
      }
    }
  }
  const pool = table.items.filter((i) => i.grade === grade);
  const item = pool[Math.floor(r2 * pool.length)];
  return { item, pityCount: grade === 'gold' ? 0 : pityCount + 1 };
}
