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

import { ANIMS } from './sprite-frames';

describe('도트 프레임 애니메이션', () => {
  it.each(Object.entries(ANIMS))('%s: 모든 프레임이 같은 크기이고 팔레트 색만 쓴다', (_, anim) => {
    const [first] = anim.frames;
    for (const f of anim.frames) {
      expect(f.length).toBe(first.length);
      for (const row of f) {
        expect(row.length).toBe(first[0].length);
        for (const ch of row) if (ch !== '.') expect(S.PALETTE[ch]).toBeDefined();
      }
    }
    expect(anim.fps).toBeGreaterThan(0);
  });
});
