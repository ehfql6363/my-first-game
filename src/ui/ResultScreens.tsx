import { useState } from 'preact/hooks';
import type { RunState } from '../core/run';
import type { NightState } from '../core/types';
import { CARDS } from '../data/cards';
import { CLUES } from '../data/clues';

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
      {last?.newClues.map((id) => (
        <div key={id} class="clue"><b>단서 획득 · {CLUES[id].name}</b>{CLUES[id].text}</div>
      ))}
      {run.phase === 'failed' && <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>1일차부터 다시 출근합니다. 수당, 단서, 캡슐 기계에서 얻은 것은 남습니다.</div>}
      <button type="button" class="btn-main" onClick={onNext}>
        {run.phase === 'failed' ? '다시 출근하기' : run.phase === 'demo-end' ? '계속' : '보상 받기'}
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

export function DemoEnd({ run, onRestart }: { run: RunState; onRestart: () => void }) {
  return (
    <main class="screen result">
      <div class="rule-label">TO BE CONTINUED</div>
      <h2>2일차 근무 완료</h2>
      <div class="pen" style={{ color: 'var(--muted)' }}>3일차 수칙서는 아직 인쇄 중입니다. 조금만 기다려 주세요. 기다릴 수 있죠?</div>
      <div class="stats">
        <span>근무 수당</span><b class="money">{run.money}</b>
        <span>덱</span><b>{run.deck.length}장</b>
        <span>모은 단서</span><b>{run.clues.length} / {Object.keys(CLUES).length}</b>
        <span>출근 횟수</span><b>{run.loop}</b>
      </div>
      {run.clues.length === 0 && <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>수칙서 뒷면의 손글씨를 다시 읽어 보세요. 놓친 것이 있을지도 모릅니다.</div>}
      <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>다시 1일차부터 출근할 수 있습니다. 수당, 단서, 캡슐 기계에서 얻은 것은 남습니다.</div>
      <button type="button" class="btn-main" onClick={onRestart}>다시 출근하기</button>
    </main>
  );
}
