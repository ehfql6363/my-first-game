import { useEffect, useState } from 'preact/hooks';
import { chooseEnding, chooseReward, newRun, nightSeed, restartRun, settleNight, toggleSuspect, visibleLoopMemos, type RunState } from '../core/run';
import { combineMods, type NightState } from '../core/types';
import { REWARD_POOL, STARTER_DECK } from '../data/cards';
import { CLOSING_REQUIREMENT, ENDING_DEFS } from '../data/endings';
import { ALL_ITEMS } from '../data/gacha';
import { RELICS } from '../data/relics';
import { LAST_DAY, nightFor } from '../data/nights';
import { DayScreen } from './DayScreen';
import { NightScreen } from './NightScreen';
import { EndingScreen, FinaleScreen, NightResult, RewardScreen } from './ResultScreens';
import { PixelSprite } from './PixelSprite';
import { Rulebook } from './Rulebook';
import { SoundToggle } from './SoundToggle';
import { MOONROO } from './sprites';
import { clearRun, loadRun, saveRun } from './storage';

// 화면 쪽에서만 시드를 고른다. 규칙(core)은 받은 시드로만 움직인다.
// 주소에 ?seed=123 을 붙이면 같은 판을 재현할 수 있다 (QA용, 로컬 개발 서버).
function newSeed(): number {
  const fixed = Number(new URLSearchParams(location.search).get('seed'));
  return Number.isInteger(fixed) && fixed > 0 ? fixed : Date.now() % 1_000_000;
}

type View = 'title' | 'run' | 'night' | 'result';

export function App() {
  const [saved] = useState(loadRun);
  const [run, setRun] = useState<RunState | null>(null);
  // 엔딩 뒤 타이틀로 돌아오면 지금 진행 중인 회차를 이어하기로 보여 준다
  const resumable = run ?? saved;
  const canContinue = resumable !== null && resumable.phase !== 'failed';
  const [view, setView] = useState<View>('title');
  const [lastNight, setLastNight] = useState<NightState | null>(null);

  useEffect(() => {
    if (run) saveRun(run);
  }, [run]);

  if (view === 'title' || !run) {
    return (
      <main class="screen title">
        <div class="title-art">
          <div class="moon" aria-hidden="true" />
          <PixelSprite sprite={MOONROO} scale={5} class="creep title-moonroo" />
        </div>
        <h1>해피문 랜드</h1>
        <div class="sub">
          야간 경비원 모집 · 시급 높음 · 경력 무관
          <br />
          수습 기간 {LAST_DAY}일
        </div>
        {resumable && resumable.endings.length > 0 && (
          <div class="sub" style={{ color: 'var(--gold)' }}>본 엔딩: {resumable.endings.map((e) => ENDING_DEFS[e].title).join(' · ')}</div>
        )}
        {canContinue && resumable && (
          <button type="button" class="btn-main" onClick={() => { setRun(resumable); setView('run'); }}>
            이어하기 · {resumable.loop > 1 ? `${resumable.loop}번째 출근 · ` : ''}{resumable.phase === 'ending' ? '엔딩' : resumable.phase === 'finale' ? '7일차 06:00' : `${resumable.day}일차 ${resumable.phase === 'reward' ? '보상' : '낮'}`}
          </button>
        )}
        <button
          type="button"
          class={canContinue ? 'btn-sub' : 'btn-main'}
          onClick={() => { clearRun(); setRun(newRun(STARTER_DECK, newSeed(), 1, undefined, ALL_ITEMS)); setView('run'); }}
        >
          {canContinue ? '새로 시작 (저장 삭제)' : '출근하기'}
        </button>
        <SoundToggle />
      </main>
    );
  }

  const mods = combineMods(run.equipped.map((id) => RELICS[id].effect));

  if (view === 'night') {
    return (
      <NightScreen
        key={`${run.loop}-${run.day}`}
        night={nightFor(run.day)}
        deck={run.deck}
        seed={nightSeed(run)}
        suspected={run.suspected}
        mods={mods}
        relicNames={run.equipped.map((id) => RELICS[id].name)}
        myMemos={visibleLoopMemos(nightFor(run.day), run)}
        clues={run.clues}
        onFinish={(state) => {
          setLastNight(state);
          setRun(settleNight(run, nightFor(run.day), state, REWARD_POOL, LAST_DAY, mods.payBonus + (nightFor(run.day).payBonus ?? 0)));
          setView('result');
        }}
      />
    );
  }

  if (view === 'result' && lastNight) {
    return (
      <NightResult
        run={run}
        night={lastNight}
        onNext={() => {
          if (run.phase === 'failed') setRun(restartRun(run, STARTER_DECK, ALL_ITEMS));
          setView('run');
        }}
      />
    );
  }

  if (run.phase === 'reward') return <RewardScreen run={run} onChoose={(id) => setRun(chooseReward(run, id))} />;
  if (run.phase === 'finale') return <FinaleScreen run={run} onChoose={(e) => setRun(chooseEnding(run, e, CLOSING_REQUIREMENT))} />;
  if (run.phase === 'ending') {
    return <EndingScreen run={run} onRestart={() => setRun(restartRun(run, STARTER_DECK, ALL_ITEMS))} onTitle={() => setView('title')} />;
  }

  // 낮. 1일차는 숙직실 대신 첫 수칙서만 보여 준다.
  if (run.day === 1) {
    return (
      <main class="screen">
        <div class="rule-label">NIGHT 01 · 근무 전 확인</div>
        {run.loop > 1 && <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{run.loop}번째 출근. 처음 출근하는 기분이다. 분명히.</div>}
        <Rulebook night={nightFor(1)} myMemos={visibleLoopMemos(nightFor(1), run)} clues={run.clues} />
        <div style={{ flex: 1 }} />
        <button type="button" class="btn-main" onClick={() => setView('night')}>수칙을 확인했습니다 · 근무 시작</button>
      </main>
    );
  }
  return <DayScreen run={run} onToggle={(no) => setRun(toggleSuspect(run, no))} onChange={setRun} onStart={() => setView('night')} />;
}
