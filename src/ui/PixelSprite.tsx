import { useEffect, useRef } from 'preact/hooks';
import { PALETTE, type Sprite } from './sprites';

interface Props {
  sprite: Sprite;
  scale: number;
  class?: string;
  style?: Record<string, string>;
  label?: string;
}

/** 글자 격자 스프라이트를 캔버스에 1픽셀씩 찍고, CSS로 확대해 도트 느낌을 살린다 */
export function PixelSprite({ sprite, scale, class: cls, style, label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const w = sprite[0].length;
  const h = sprite.length;

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
