import { useEffect, useState } from 'preact/hooks';
import { chooseReward, newRun, nightSeed, restartRun, settleNight, toggleSuspect, visibleLoopMemos, type RunState } from '../core/run';
import { combineMods, type NightState } from '../core/types';
import { REWARD_POOL, STARTER_DECK } from '../data/cards';
import { GACHA } from '../data/gacha';
import { RELICS } from '../data/relics';
import { LAST_DAY, nightFor } from '../data/nights';
import { DayScreen } from './DayScreen';
import { NightScreen } from './NightScreen';
import { DemoEnd, NightResult, RewardScreen } from './ResultScreens';
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
  const canContinue = saved !== null && (saved.phase === 'day' || saved.phase === 'reward');
  const [run, setRun] = useState<RunState | null>(null);
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
          체험판 · 1~{LAST_DAY}일차
        </div>
        {canContinue && (
          <button type="button" class="btn-main" onClick={() => { setRun(saved); setView('run'); }}>
            이어하기 · {saved.loop > 1 ? `${saved.loop}번째 출근 · ` : ''}{saved.day}일차 {saved.phase === 'reward' ? '보상' : '낮'}
          </button>
        )}
        <button
          type="button"
          class={canContinue ? 'btn-sub' : 'btn-main'}
          onClick={() => { clearRun(); setRun(newRun(STARTER_DECK, newSeed(), 1, undefined, GACHA)); setView('run'); }}
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
        onFinish={(state) => {
          setLastNight(state);
          setRun(settleNight(run, nightFor(run.day), state, REWARD_POOL, LAST_DAY, mods.payBonus));
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
          if (run.phase === 'failed') setRun(restartRun(run, STARTER_DECK, GACHA));
          setView('run');
        }}
      />
    );
  }

  if (run.phase === 'reward') return <RewardScreen run={run} onChoose={(id) => setRun(chooseReward(run, id))} />;
  if (run.phase === 'demo-end') {
    return <DemoEnd run={run} onRestart={() => setRun(restartRun(run, STARTER_DECK, GACHA))} />;
  }

  // 낮. 1일차는 숙직실 대신 첫 수칙서만 보여 준다.
  if (run.day === 1) {
    return (
      <main class="screen">
        <div class="rule-label">NIGHT 01 · 근무 전 확인</div>
        {run.loop > 1 && <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{run.loop}번째 출근. 처음 출근하는 기분이다. 분명히.</div>}
        <Rulebook night={nightFor(1)} myMemos={visibleLoopMemos(nightFor(1), run)} />
        <div style={{ flex: 1 }} />
        <button type="button" class="btn-main" onClick={() => setView('night')}>수칙을 확인했습니다 · 근무 시작</button>
      </main>
    );
  }
  return <DayScreen run={run} onToggle={(no) => setRun(toggleSuspect(run, no))} onChange={setRun} onStart={() => setView('night')} />;
}
