import { useEffect, useState } from 'preact/hooks';
import { reducedMotion } from './motion';

interface Props {
  lines: string[];
  /** 글자 하나가 나오는 간격(ms) */
  speed?: number;
  onDone?: () => void;
}

/** 문장을 한 글자씩 타이핑하듯 보여 준다. 누르면 전부 보여 준다 */
export function TypeLines({ lines, speed = 45, onDone }: Props) {
  const total = lines.reduce((n, l) => n + l.length, 0);
  const [shown, setShown] = useState(() => (reducedMotion() ? total : 0));
  const done = shown >= total;

  useEffect(() => {
    if (done) {
      onDone?.();
      return;
    }
    // 줄이 바뀌는 순간에는 조금 쉰다
    let acc = 0;
    let pause = false;
    for (const l of lines) {
      acc += l.length;
      if (shown === acc) pause = true;
    }
    const id = window.setTimeout(() => setShown((n) => n + 1), pause ? 450 : speed);
    return () => window.clearTimeout(id);
  }, [shown, done]);

  let left = shown;
  return (
    <div class="typelines" onClick={() => setShown(total)}>
      {lines.map((l, i) => {
        const part = l.slice(0, Math.max(0, left));
        left -= l.length;
        if (!part) return null;
        return (
          <p key={i} style={{ margin: 0 }}>
            {part}
            {part.length < l.length && <span class="caret" aria-hidden="true">▌</span>}
          </p>
        );
      })}
      {/* 화면 낭독기는 처음부터 전체 문장을 읽는다 */}
      <span class="sr-only">{lines.join(' ')}</span>
      {!done && (
        <button type="button" class="skip" onClick={() => setShown(total)}>
          건너뛰기
        </button>
      )}
    </div>
  );
}
