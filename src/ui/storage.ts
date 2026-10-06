// 브라우저 저장소. 막혀 있거나 비어 있어도 게임은 정상 동작해야 한다.
import type { RunState } from '../core/run';
import { parseRun, serializeRun } from '../core/save';
import { CARDS } from '../data/cards';
import { CLUES } from '../data/clues';

const KEY = 'happymoon-land/run';
const knownCards = new Set(Object.keys(CARDS));
const knownClues = new Set(Object.keys(CLUES));

export function loadRun(): RunState | null {
  try {
    return parseRun(localStorage.getItem(KEY), knownCards, knownClues);
  } catch {
    return null;
  }
}

export function saveRun(run: RunState): void {
  try {
    localStorage.setItem(KEY, serializeRun(run));
  } catch {
    // 저장이 막힌 환경(비공개 창 등): 이번 접속 동안만 진행
  }
}

export function clearRun(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 무시
  }
}
