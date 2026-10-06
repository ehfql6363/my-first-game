import { useState } from 'preact/hooks';
import { activeAnomalies } from '../core/night';
import type { NightState } from '../core/types';
import { NIGHT_1 } from '../data/night1';
import { NightScreen } from './NightScreen';
import { Rulebook } from './Rulebook';

type Screen = { name: 'title' } | { name: 'rules' } | { name: 'night'; seed: number } | { name: 'result'; state: NightState; seed: number };

// 화면 쪽에서만 시드를 고른다. 규칙(core)은 받은 시드로만 움직인다.
// 주소에 ?seed=123 을 붙이면 같은 판을 재현할 수 있다 (QA용).
function newSeed(): number {
  const fixed = Number(new URLSearchParams(location.search).get('seed'));
  return Number.isInteger(fixed) && fixed > 0 ? fixed : Date.now() % 1_000_000;
}

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'title' });
  const night = NIGHT_1;

  if (screen.name === 'title') {
    return (
      <main class="screen title">
        <div class="moon" aria-hidden="true" />
        <h1>해피문 랜드</h1>
        <div class="sub">
          야간 경비원 모집 · 시급 높음 · 경력 무관
          <br />
          체험판 · 1일차 밤
        </div>
        <button type="button" class="btn-main" onClick={() => setScreen({ name: 'rules' })}>출근하기</button>
      </main>
    );
  }

  if (screen.name === 'rules') {
    return (
      <main class="screen">
        <div class="rule-label">NIGHT 0{night.day} · 근무 전 확인</div>
        <Rulebook night={night} />
        <div style={{ flex: 1 }} />
        <button type="button" class="btn-main" onClick={() => setScreen({ name: 'night', seed: newSeed() })}>
          수칙을 확인했습니다 · 근무 시작
        </button>
      </main>
    );
  }

  if (screen.name === 'night') {
    return <NightScreen key={screen.seed} night={night} seed={screen.seed} onFinish={(state) => setScreen({ name: 'result', state, seed: screen.seed })} />;
  }

  const { state } = screen;
  const survived = state.outcome === 'survived';
  const appeared = night.anomalies.filter((a) => a.appearsAtTurn < state.turn).length;
  const missed = activeAnomalies(night, state).length;
  return (
    <main class="screen result">
      <div class="rule-label">{survived ? 'SHIFT CLEAR' : 'SHIFT OVER'}</div>
      <div class="big" style={{ color: survived ? 'var(--mint)' : 'var(--pink)', animation: survived ? undefined : 'knock 0.4s 3' }}>
        {survived ? '06:00' : '똑. 똑. 똑.'}
      </div>
      <h2>{survived ? '정문이 나타났다.' : '경비실 문을 두드리는 소리가 난다.'}</h2>
      <div class="pen" style={{ color: survived ? 'var(--muted)' : 'var(--pink)' }}>
        {survived ? '수고하셨습니다. 내일도 꼭 출근해 주세요.' : '…수습생 님? 문 열어 주세요. 웃는 얼굴로.'}
      </div>
      <div class="stats">
        <span>대응한 이상 현상</span><b>{state.resolved.length} / {appeared}</b>
        <span>놓친 이상 현상</span><b>{missed}</b>
        <span>최종 위험도</span><b>{state.risk} / 10</b>
        <span>근무 번호 (재현용)</span><b>#{screen.seed}</b>
      </div>
      <button type="button" class="btn-main" onClick={() => setScreen({ name: 'night', seed: newSeed() })}>다시 근무하기</button>
      <button type="button" class="btn-sub" onClick={() => setScreen({ name: 'title' })}>타이틀로</button>
    </main>
  );
}
