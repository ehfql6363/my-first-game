// 도트 프레임 애니메이션. 기본 스프라이트에서 몇 줄만 바꾼 프레임을 이어 붙인다.
import { BALLOON, GHOST, GUARD_FRONT, MOONROO, STAR, TAEO, type Sprite } from './sprites';

export interface Anim {
  frames: Sprite[];
  /** 초당 프레임 */
  fps: number;
}

/** base에서 지정한 줄만 바꾼 새 프레임 */
function swap(base: Sprite, rows: Record<number, string>): Sprite {
  return base.map((r, i) => rows[i] ?? r);
}

const MOONROO_BLINK = swap(MOONROO, { 7: 'KWWWWWWWWWWWWWWK', 8: 'KWWKKWWWWWWKKWWK' });
const MOONROO_GRIN = swap(MOONROO, { 10: 'KRRWWWWWWWWWWRRK', 11: 'KWRRRRRRRRRRRRWK' });

export const ANIMS = {
  /** 웃는 문루: 가끔 눈을 깜빡이고, 아주 가끔 입이 더 찢어진다 */
  moonrooIdle: { fps: 4, frames: [MOONROO, MOONROO, MOONROO, MOONROO, MOONROO, MOONROO_BLINK, MOONROO, MOONROO, MOONROO, MOONROO_GRIN, MOONROO_GRIN, MOONROO] },
  /** 행렬의 문루: 박자에 맞춰 깜빡 */
  moonrooMarch: { fps: 4, frames: [MOONROO, MOONROO_BLINK] },
  ghost: {
    fps: 3,
    frames: [GHOST, swap(GHOST, { 10: '.KKWWKWWKWK.', 11: '..KK.KK.KK..' })],
  },
  balloon: {
    fps: 2,
    frames: [BALLOON, swap(BALLOON, { 10: '.....K......', 11: '......K.....', 12: '.....K......' })],
  },
  taeoWalk: {
    fps: 4,
    frames: [TAEO, swap(TAEO, { 12: '.Kv.vK..', 13: '.KK.KK..' }), TAEO, swap(TAEO, { 12: '..Kv.vK.', 13: '..KK.KK.' })],
  },
  guardStare: {
    fps: 3,
    frames: [GUARD_FRONT, GUARD_FRONT, GUARD_FRONT, GUARD_FRONT, swap(GUARD_FRONT, { 4: '.KSSSSK.' }), GUARD_FRONT],
  },
  star: {
    fps: 3,
    frames: [STAR, swap(STAR, { 0: '.........', 1: '....Y....', 3: 'YYYYYYYYY' })],
  },
} satisfies Record<string, Anim>;
