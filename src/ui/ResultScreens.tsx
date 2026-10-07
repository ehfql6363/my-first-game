import { useState } from 'preact/hooks';
import { canChoose, ENDINGS, type EndingId, type RunState } from '../core/run';
import type { NightState } from '../core/types';
import { CARDS } from '../data/cards';
import { CLUES } from '../data/clues';
import { ALL_COMPANION_IDS } from '../data/companions';
import { CLOSING_REQUIREMENT, ENDING_DEFS } from '../data/endings';

export function NightResult({ run, night, onNext }: { run: RunState; night: NightState; onNext: () => void }) {
  const survived = night.outcome === 'survived';
  const last = run.lastNight;
  return (
    <main class="screen result">
      <div class="rule-label">{survived ? `DAY 0${last?.day} SHIFT CLEAR` : 'SHIFT OVER'}</div>
      <div class="big" style={{ color: survived ? 'var(--mint)' : 'var(--pink)', animation: survived ? undefined : 'knock 0.4s 3' }}>
        {survived ? '06:00' : '똑. 똑. 똑.'}
      </div>
      <h2>{survived ? '정문이 나타났다.' : '경비실 문을 두드리는 소리가 난다.'}</h2>
      <div class="pen" style={{ color: survived ? 'var(--muted)' : 'var(--pink)' }}>
        {survived ? '수고하셨습니다. 내일도 꼭 출근해 주세요.' : '…수습생 님? 문 열어 주세요. 웃는 얼굴로.'}
      </div>
      <div class="stats">
        <span>대응한 이상 현상</span><b>{night.resolved.length}</b>
        <span>최종 위험도</span><b>{night.risk} / 10</b>
        {survived && <><span>근무 수당</span><b class="money">+{last?.pay}</b></>}
        <span>근무 번호 (재현용)</span><b>#{run.seed}-{run.loop}-{last?.day}</b>
      </div>
      {(last?.debt ?? 0) > 0 && <div class="clue"><b>문루 빚 +{last?.debt}</b>받은 만큼 덱에 웃음소리 카드가 섞였다. 이번 회차 빚: {run.debt}</div>}
      {last?.newClues.map((id) => (
        <div key={id} class="clue"><b>단서 획득 · {CLUES[id].name}</b>{CLUES[id].text}</div>
      ))}
      {run.phase === 'failed' && <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>1일차부터 다시 출근합니다. 수당, 단서, 캡슐 기계에서 얻은 것은 남습니다.</div>}
      <button type="button" class="btn-main" onClick={onNext}>
        {run.phase === 'failed' ? '다시 출근하기' : run.phase === 'finale' ? '06:00' : '보상 받기'}
      </button>
    </main>
  );
}

export function RewardScreen({ run, onChoose }: { run: RunState; onChoose: (cardId: string | null) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <main class="screen result">
      <div class="rule-label">REWARD</div>
      <h2>어젯밤 근무 보상</h2>
      <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
        경비실 서랍에 물건이 세 개 놓여 있다. 하나만 가져갈 수 있다. 가져간 카드는 덱에 들어간다.
      </div>
      {run.rewardOptions.length === 0 && <div style={{ fontSize: '13px', color: 'var(--muted)' }}>…서랍이 비어 있다. 누군가 먼저 가져간 것 같다.</div>}
      <div class="rewards">
        {run.rewardOptions.map((id) => {
          const c = CARDS[id];
          return (
            <button type="button" key={id} class="card" aria-pressed={picked === id} onClick={() => setPicked(id)}>
              <span class="cost">{c.cost ?? 'X'}</span>
              <span class="name">{c.name}</span>
              <span class="desc">{c.desc}</span>
            </button>
          );
        })}
      </div>
      <button type="button" class="btn-main" disabled={!picked} style={{ opacity: picked ? 1 : 0.5 }} onClick={() => onChoose(picked)}>
        {picked ? `${CARDS[picked].name} 가져가기` : '카드를 고르세요'}
      </button>
      <button type="button" class="btn-sub" onClick={() => onChoose(null)}>아무것도 가져가지 않기</button>
    </main>
  );
}

/** 7일차를 버틴 뒤: 엔딩 선택 */
export function FinaleScreen({ run, onChoose }: { run: RunState; onChoose: (e: EndingId) => void }) {
  const missing = ALL_COMPANION_IDS.filter((id) => !run.owned.includes(id)).length;
  return (
    <main class="screen result finale">
      <div class="rule-label">06:00 · 마지막 퍼레이드가 멈췄다</div>
      <h2>방송이 내 이름을 정확히 부른다.</h2>
      <div class="pen" style={{ color: 'var(--pink)' }}>"수습 기간 동안 수고 많으셨습니다. 대답해 주세요. 웃는 얼굴로."</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {ENDINGS.map((id) => {
          const ok = canChoose(run, id, CLOSING_REQUIREMENT);
          if (id === 'closing' && !ok) {
            const why = [!run.clues.includes('own-name') && '이름을 모른다', missing > 0 && `구출하지 못한 동료 ${missing}명`].filter(Boolean).join(' · ');
            return (
              <button type="button" key={id} class="btn-sub" disabled style={{ opacity: 0.5, textAlign: 'left' }}>
                ████████을 부른다 ({why})
              </button>
            );
          }
          return (
            <button type="button" key={id} class={id === 'closing' ? 'btn-main' : 'btn-sub'} style={{ textAlign: 'left', padding: '10px 14px' }} onClick={() => onChoose(id)}>
              {ENDING_DEFS[id].choice}
            </button>
          );
        })}
      </div>
    </main>
  );
}

export function EndingScreen({ run, onRestart, onTitle }: { run: RunState; onRestart: () => void; onTitle: () => void }) {
  const def = ENDING_DEFS[run.lastEnding ?? 'resign'];
  return (
    <main class={`screen result ending ending-${def.id}`}>
      <div class="rule-label">{def.kind}</div>
      <h2 style={{ fontSize: '32px' }}>{def.title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px', lineHeight: 1.7 }}>
        {def.lines.map((l) => (
          <p key={l} style={{ margin: 0 }}>{l}</p>
        ))}
      </div>
      <div class="stats">
        <span>본 엔딩</span><b>{run.endings.length} / {ENDINGS.length}</b>
        <span>모은 단서</span><b>{run.clues.length} / {Object.keys(CLUES).length}</b>
        <span>구출한 동료</span><b>{ALL_COMPANION_IDS.filter((id) => run.owned.includes(id)).length} / {ALL_COMPANION_IDS.length}</b>
        <span>출근 횟수</span><b>{run.loop}</b>
      </div>
      {def.id !== 'closing' && <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>다시 1일차부터 출근할 수 있습니다. 수당, 단서, 동료, 엔딩 기록은 남습니다.</div>}
      <button type="button" class="btn-main" onClick={onRestart}>{def.id === 'closing' ? '처음부터 다시 출근하기' : '다시 출근하기'}</button>
      <button type="button" class="btn-sub" onClick={onTitle}>타이틀로</button>
    </main>
  );
}
