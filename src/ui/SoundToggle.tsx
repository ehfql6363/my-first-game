import { useState } from 'preact/hooks';
import { isMuted, play, setMuted } from './sound';

export function SoundToggle() {
  const [muted, setState] = useState(isMuted);
  return (
    <button
      type="button"
      class="sound-toggle"
      aria-pressed={!muted}
      onClick={() => {
        setMuted(!muted);
        setState(!muted);
        if (muted) play('card');
      }}
    >
      {muted ? '소리 꺼짐' : '소리 켜짐'}
    </button>
  );
}
