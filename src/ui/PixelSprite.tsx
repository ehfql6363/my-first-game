import { useEffect, useRef, useState } from 'preact/hooks';
import { reducedMotion } from './motion';
import type { Anim } from './sprite-frames';
import { PALETTE, type Sprite } from './sprites';

interface Props {
  sprite: Sprite;
  /** 있으면 프레임을 돌려 가며 그린다 (sprite는 첫 프레임과 크기가 같아야 함) */
  anim?: Anim;
  scale: number;
  class?: string;
  style?: Record<string, string>;
  label?: string;
}

/** 글자 격자 스프라이트를 캔버스에 1픽셀씩 찍고, CSS로 확대해 도트 느낌을 살린다 */
export function PixelSprite({ sprite: still, anim, scale, class: cls, style, label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [frame, setFrame] = useState(0);
  const sprite = anim ? anim.frames[frame % anim.frames.length] : still;
  const w = sprite[0].length;
  const h = sprite.length;

  useEffect(() => {
    if (!anim || anim.frames.length < 2 || reducedMotion()) return;
    const id = window.setInterval(() => setFrame((f) => f + 1), 1000 / anim.fps);
    return () => window.clearInterval(id);
  }, [anim]);

  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    sprite.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (ch === '.') return;
        ctx.fillStyle = PALETTE[ch];
        ctx.fillRect(x, y, 1, 1);
      });
    });
  }, [sprite, w, h]);

  return (
    <canvas
      ref={ref}
      width={w}
      height={h}
      class={cls ? `pixel ${cls}` : 'pixel'}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
      style={{ width: `${w * scale}px`, height: `${h * scale}px`, ...style }}
    />
  );
}
