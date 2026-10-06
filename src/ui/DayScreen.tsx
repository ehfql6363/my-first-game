import { useState } from 'preact/hooks';
import type { RunState } from '../core/run';
import { CARDS } from '../data/cards';
import { CLUES } from '../data/clues';
import { SPEAKERS } from '../data/dialogue';
import { nightFor } from '../data/nights';
import { Rulebook } from './Rulebook';

interface Props {
  run: RunState;
  onToggle: (ruleNo: number) => void;
  onStart: () => void;
}

const TABS = ['준비', '동료와 대화', '덱·단서'] as const;

export function DayScreen({ run, onToggle, onStart }: Props) {
  const [tab, setTab] = useState(0);
  const night = nightFor(run.day);

  return (
    <main class="screen day">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div class="label">DAY 0{run.day} · 숙직실</div>
          <div style={{ fontSize: '11px', color: '#d9cbe8' }}>{run.loop > 1 ? `${run.loop}번째 출근 · ` : ''}다음 근무까지 8시간 20분</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#d9cbe8' }}>근무 수당</div>
          <div class="money" style={{ fontSize: '18px' }}>{run.money.toLocaleString()}</div>
        </div>
      </div>

      <div class="window" aria-hidden="true">
        <div class="abs" style={{ right: '40px', top: '14px', width: '30px', height: '30px', borderRadius: '50%', background: '#fff1c9' }} />
        <div class="abs" style={{ left: 0, right: 0, bottom: 0, height: '28px', background: '#b9653a' }} />
        <div class="abs" style={{ left: 0, right: 0, bottom: '28px', height: '16px', backgroundImage: 'repeating-linear-gradient(90deg, #6b3b24 0 4px, transparent 4px 18px)' }} />
        <div class="abs" style={{ left: '50%', top: 0, bottom: 0, width: '5px', background: '#4a3a2a' }} />
        <div class="abs pen" style={{ left: '12px', top: '6px', width: '42%', fontSize: '18px', lineHeight: 1.05, color: '#4a2a1a', transform: 'rotate(-3deg)' }}>정문이 안 보여. 해도 안 움직여.</div>
      </div>

      <div class="tabs" role="tablist" aria-label="숙직실">
        {TABS.map((t, i) => (
          <button type="button" role="tab" key={t} class="tab" aria-selected={tab === i} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      <div class="day-body">
        {tab === 0 && (
          <>
            <div style={{ fontSize: '12px', color: '#d9cbe8', lineHeight: 1.5 }}>오늘 밤 수칙서를 미리 읽고, 믿을 수 없는 수칙에 표시해 두세요. 표시는 근무 중 수칙 띠에 빨간 줄로 보입니다.</div>
            <Rulebook night={night} suspected={run.suspected} onToggle={onToggle} />
          </>
        )}
        {tab === 1 && <Talk day={run.day} />}
        {tab === 2 && <DeckAndClues run={run} />}
      </div>

      <button type="button" class="btn-main" onClick={onStart}>근무 시작 · 00:00</button>
    </main>
  );
}

function Talk({ day }: { day: number }) {
  const people = SPEAKERS.filter((p) => p.lines[day]);
  const [who, setWho] = useState(0);
  const [line, setLine] = useState(0);
  if (people.length === 0) return <div class="talk"><p>숙직실에 아무도 없다. 의자가 하나 더 놓여 있다.</p></div>;
  const p = people[who];
  const lines = p.lines[day];
  const last = line >= lines.length - 1;
  return (
    <>
      <div class="people">
        {people.map((q, i) => (
          <button type="button" key={q.id} class="person" aria-pressed={who === i} onClick={() => { setWho(i); setLine(0); }}>
            <span class="face" style={{ background: q.color }}>{q.name[0]}</span>
            <b>{q.name}</b>
            <span style={{ fontSize: '10px', color: '#d9cbe8' }}>{q.tag}</span>
          </button>
        ))}
      </div>
      <div class="talk">
        <p>"{lines[line]}"</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--pixel)', fontSize: '11px', color: '#d9cbe8' }}>{line + 1} / {lines.length}</span>
          <button type="button" class="btn-sub" style={{ background: '#ffb877', color: 'var(--ink)', fontWeight: 700 }} onClick={() => setLine(last ? 0 : line + 1)}>
            {last ? '처음부터' : '다음'}
          </button>
        </div>
      </div>
    </>
  );
}

function DeckAndClues({ run }: { run: RunState }) {
  const counts = new Map<string, number>();
  for (const id of run.deck) counts.set(id, (counts.get(id) ?? 0) + 1);
  return (
    <>
      <div style={{ fontSize: '12px', fontWeight: 700 }}>덱 {run.deck.length}장</div>
      <div class="deck-list">
        {[...counts].map(([id, n]) => {
          const c = CARDS[id];
          return (
            <div key={id} class={`deck-row ${c.kind}`}>
              <span style={{ fontFamily: 'var(--pixel)', width: '18px' }}>{c.cost ?? 'X'}</span>
              <span style={{ flex: 1 }}>
                <b>{c.name}</b>
                <small>{c.desc}</small>
              </span>
              <span style={{ fontFamily: 'var(--pixel)' }}>x{n}</span>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: '12px', fontWeight: 700 }}>단서 {run.clues.length}개</div>
      {run.clues.length === 0 && <div style={{ fontSize: '12px', color: '#d9cbe8' }}>아직 없다. 수칙서를 너무 믿지 않는 편이 좋을지도.</div>}
      {run.clues.map((id) => (
        <div key={id} class="clue"><b>{CLUES[id].name}</b>{CLUES[id].text}</div>
      ))}
    </>
  );
}
