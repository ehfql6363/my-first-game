import { describe, expect, it } from 'vitest';
import * as S from './sprites';

const sprites = Object.entries(S).filter(([k]) => k !== 'PALETTE') as [string, readonly string[]][];

describe('도트 스프라이트', () => {
  it.each(sprites)('%s: 모든 줄의 폭이 같고, 팔레트에 있는 색만 쓴다', (_, sprite) => {
    const width = sprite[0].length;
    for (const row of sprite) {
      expect(row.length).toBe(width);
      for (const ch of row) if (ch !== '.') expect(S.PALETTE[ch], `${ch}`).toBeDefined();
    }
  });
});
