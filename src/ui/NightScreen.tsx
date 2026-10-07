import { useEffect, useRef, useState } from 'preact/hooks';
import { activeAnomalies, batteryPerTurn, clockText, createNight, endTurn, expiredAt, maxRisk, playCard } from '../core/night';
import { NO_MODS, type NightDef, type NightMods, type NightState } from '../core/types';
import { CARDS } from '../data/cards';
import { CameraView } from './CameraView';
import { Rulebook } from './Rulebook';
import { play as sfx, startHum, stopHum } from './sound';
import { SoundToggle } from './SoundToggle';

interface Props {
  night: NightDef;
  deck: string[];
  seed: number;
  suspected: number[];
  mods?: NightMods;
  relicNames?: string[];
  myMemos?: string[];
  clues?: string[];
  onFinish: (state: NightState) => void;
}

const FAIL_REASON = {
  cursed: '킥킥킥킥. 손에서 떨어지지 않는다.',
  'no-battery': '배터리가 부족하다.',
  'not-playing': '',
  'bad-index': '',
} as const;

export function NightScreen({ night, deck, seed, suspected, mods = NO_MODS, relicNames = [], myMemos = [], clues = [], onFinish }: Props) {
  const [state, setState] = useState(() => createNight(night, deck, seed, mods));
  const [camIndex, setCamIndex] = useState(0);
  const [msg, setMsg] = useState('근무 시작. 카메라를 넘겨 보며 수칙대로 대응하십시오.');
  const [showRules, setShowRules] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const glitchTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    startHum();
    return () => {
      stopHum();
      window.clearTimeout(glitchTimer.current);
    };
  }, []);

  // 위험도가 최대치의 70% 이상이면 화면이 불안정해진다
  const dread = state.risk >= Math.ceil(maxRisk(state) * 0.7);

  const cam = night.cameras[camIndex];
  const active = activeAnomalies(night, state);
  const kindsOn = (camId: string) => active.filter((a) => a.cameraId === camId).map((a) => a.kind);

  function switchCam(i: number) {
    if (i !== camIndex) sfx('switch');
    setCamIndex(i);
  }

  function play(index: number) {
    const r = playCard(night, CARDS, state, index, cam.id);
    if (!r.ok) {
      if (r.reason === 'cursed') sfx('laugh');
      setMsg(FAIL_REASON[r.reason]);
      return;
    }
    setState(r.state);
    const card = CARDS[state.hand[index]];
    sfx(r.resolvedAnomaly ? 'success' : 'card');
    if (card.response === 'zoom') setMsg('모든 카메라의 이상 유무가 표시됐다. 이번 턴만.');
    else if ((r.resolvedCount ?? 0) > 1) setMsg(`대응 성공: ${r.resolvedCount}건을 한 번에 정리했다.`);
    else if (r.resolvedAnomaly) setMsg(r.resolvedAnomaly.resolvedText ?? `대응 성공: ${r.resolvedAnomaly.name}.`);
    else setMsg(`${cam.name}에 [${card.name}]. 아무 일도 일어나지 않았다.`);
  }

  function finishTurn() {
    const stared = active.some((a) => a.gaze && a.cameraId === cam.id);
    const next = endTurn(night, state, cam.id);
    const gained = next.risk - state.risk;
    setState(next);
    if (next.outcome !== 'playing') {
      sfx(next.outcome === 'failed' ? 'knock' : 'clear');
      onFinish(next);
      return;
    }
    const appeared = night.anomalies.some((a) => a.appearsAtTurn === next.turn);
    sfx(appeared ? 'appear' : 'tick');
    if (appeared) {
      setGlitch(true);
      window.clearTimeout(glitchTimer.current);
      glitchTimer.current = window.setTimeout(() => setGlitch(false), 450);
    }
    const nowDread = next.risk >= Math.ceil(maxRisk(next) * 0.7);
    const passed = `${night.minutesPerTurn}분이 지났다.`;
    const gone = expiredAt(night, next).map((a) => a.expiredText).filter(Boolean).join(' ');
    const base = gained > 0 ? `${passed} 어딘가에서 웃음소리가 커진다. 위험도 +${gained}` : `${passed} 조용하다. …너무 조용하다.`;
    const warn = nowDread && !dread ? ' 누군가 경비실 쪽으로 걸어온다.' : '';
    const eye = stared ? '화면 속 그것과 눈이 마주쳤다. ' : '';
    setMsg(eye + (gone ? `${base} ${gone}` : base) + warn);
  }

  return (
    <div class={dread ? 'screen dread' : 'screen'}>
      <div class="hud">
        <div class="hud-left">
          <div class="rule-label">NIGHT 0{night.day} · 경비실</div>
          <div class="meter">
            배터리
            {Array.from({ length: Math.max(batteryPerTurn(state), state.battery) }, (_, i) => (
              <div key={i} class={i < state.battery ? 'pip on' : 'pip'} />
            ))}
          </div>
          <div class="meter">
            위험도
            <div class="risk-bar" role="meter" aria-valuemin={0} aria-valuemax={maxRisk(state)} aria-valuenow={state.risk} aria-label="위험도">
              <div style={{ width: `${(state.risk / maxRisk(state)) * 100}%` }} />
            </div>
            <span style={{ color: 'var(--pink)', fontFamily: 'var(--pixel)' }}>{state.risk}/{maxRisk(state)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div class="clock">
          <b>{clockText(night, state.turn)}</b>
          <span>06:00까지 {night.endTurn - state.turn}턴</span>
        </div>
        <SoundToggle />
        </div>
      </div>

      {relicNames.length > 0 && <div class="relic-line">기념품 · {relicNames.join(' · ')}</div>}
      <button type="button" class="rule-strip" onClick={() => setShowRules(true)}>
        <div class="strip-rules">
          {night.rules.filter((r) => r.short).map((r) => (
            <div key={r.no} class={suspected.includes(r.no) ? 'suspect' : undefined}><b>{r.no}.</b> {r.short}</div>
          ))}
        </div>
        <small>눌러서 수칙서 전체 보기</small>
      </button>

      <CameraView cameraId={cam.id} cameraName={cam.name} code={`CAM 0${camIndex + 1}`} clock={clockText(night, state.turn)} kinds={kindsOn(cam.id)} dread={dread} glitch={glitch} />

      <div class="thumbs">
        {night.cameras.map((c, i) => {
          const bad = kindsOn(c.id).length > 0;
          return (
            <button type="button" key={c.id} class={i === camIndex ? 'thumb on' : 'thumb'} aria-pressed={i === camIndex} onClick={() => switchCam(i)}>
              <span class="code">CAM 0{i + 1}</span>
              <span>{c.name}</span>
              {state.revealed && <span class={bad ? 'flag bad' : 'flag ok'}>{bad ? '이상' : '없음'}</span>}
            </button>
          );
        })}
      </div>

      <div class="msg" role="status">{msg}</div>

      <div style={{ fontSize: '10px', color: 'var(--muted)' }}>카드를 누르면 지금 보는 카메라({cam.name})에 사용합니다.</div>
      <div class="hand">
        {state.hand.map((id, i) => {
          const c = CARDS[id];
          const cursed = c.cost === null;
          const disabled = !cursed && (c.cost ?? 0) > state.battery;
          return (
            <button type="button" key={`${id}-${i}`} class={cursed ? 'card curse' : 'card'} disabled={disabled} onClick={() => play(i)}>
              <span class="cost">{cursed ? 'X' : c.cost}</span>
              <span class="name">{c.name}</span>
              <span class="desc">{c.desc}</span>
            </button>
          );
        })}
      </div>

      <button type="button" class="btn-main" onClick={finishTurn}>
        턴 종료 · {night.minutesPerTurn}분 경과
      </button>

      {showRules && (
        <div class="overlay" role="dialog" aria-modal="true" aria-label="수칙서" onClick={() => setShowRules(false)}>
          <div style={{ width: '100%', maxWidth: '398px', display: 'flex', flexDirection: 'column', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
            <Rulebook night={night} suspected={suspected} myMemos={myMemos} clues={clues} />
            <button type="button" class="btn-sub" onClick={() => setShowRules(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
