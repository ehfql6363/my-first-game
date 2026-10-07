import { useEffect, useRef, useState } from 'preact/hooks';
import { itemRates, poolFor, type GachaItem } from '../core/gacha';
import { closingShortfall, grantStoryItem, pullCapsule, type RunState } from '../core/run';
import { CARDS } from '../data/cards';
import { COMPANIONS, STORY_COMPANIONS } from '../data/companions';
import { BLACK_CAPSULE_REQUIREMENT } from '../data/endings';
import { GACHA, GRADE_COLOR, GRADE_LABEL, STORY_ITEMS } from '../data/gacha';
import { RELICS } from '../data/relics';
import { reducedMotion } from './motion';
import { play as sfx } from './sound';

const BALLS: [string, string, string][] = [
  ['18px', '96px', GRADE_COLOR.white], ['50px', '110px', GRADE_COLOR.blue], ['82px', '98px', GRADE_COLOR.white], ['114px', '112px', GRADE_COLOR.purple],
  ['146px', '96px', GRADE_COLOR.white], ['178px', '108px', GRADE_COLOR.blue], ['40px', '70px', GRADE_COLOR.white], ['74px', '74px', GRADE_COLOR.gold],
  ['108px', '66px', GRADE_COLOR.blue], ['142px', '72px', '#0b0b12'],
];

export function CapsuleTab({ run, onChange }: { run: RunState; onChange: (run: RunState) => void }) {
  const [last, setLast] = useState<{ item: GachaItem; duplicate: boolean } | null>(null);
  const [showOdds, setShowOdds] = useState(false);
  /** 연출 단계: 손잡이 돌림 → 캡슐이 떨어짐 → (결과) */
  const [stage, setStage] = useState<'idle' | 'turn' | 'drop'>('idle');
  const [ballColor, setBallColor] = useState('');
  const [flash, setFlash] = useState<'' | 'gold' | 'purple' | 'blue' | 'black'>('');
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const busy = stage !== 'idle';
  const canPull = run.money >= GACHA.cost && !busy;

  /** 결과는 바로 확정(저장)하고, 화면에는 연출이 끝난 뒤 보여 준다 */
  function animate(item: GachaItem, duplicate: boolean, black = false) {
    sfx('capsule');
    setLast(null);
    const color = black ? '#0b0b12' : GRADE_COLOR[item.grade];
    const glow = black ? 'black' : item.grade === 'gold' ? 'gold' : item.grade === 'purple' ? 'purple' : item.grade === 'blue' ? 'blue' : '';
    const reveal = () => {
      setStage('idle');
      setFlash(glow);
      if (item.grade === 'gold' || black) sfx('gold');
      setLast({ item, duplicate });
      timers.current.push(window.setTimeout(() => setFlash(''), 900));
    };
    if (reducedMotion()) return reveal();
    setBallColor(color);
    setStage('turn');
    timers.current.push(window.setTimeout(() => setStage('drop'), 550));
    timers.current.push(window.setTimeout(reveal, 1350));
  }

  // 스토리 캡슐 (뽑기 아님): 5일차 특별 근무일의 확정 캡슐, 이름을 알고 모두 구출하면 검은 캡슐
  const taeoReady = run.day >= 5 && !run.owned.includes('taeo-figure');
  const black = closingShortfall(run, BLACK_CAPSULE_REQUIREMENT);
  const blackReady = !black.clue && black.owned.length === 0 && black.more === 0 && !run.owned.includes('dalhee-0');
  function openStory(id: string) {
    const item = STORY_ITEMS.find((i) => i.id === id)!;
    onChange(grantStoryItem(run, item));
    animate(item, false, id === 'dalhee-0');
  }

  function pull() {
    if (busy) return;
    const r = pullCapsule(run, GACHA);
    if (!r) return;
    onChange(r.run);
    animate(r.item, r.duplicate);
  }

  return (
    <>
      {flash && <div class={`capsule-flash flash-${flash}`} aria-hidden="true" />}
      <div class={busy ? 'machine shaking' : 'machine'}>
        <div class="dome" aria-hidden="true">
          {BALLS.map(([l, t, c], i) => (
            <i key={i} style={{ left: l, top: t, background: c }} />
          ))}
          <span class="abs pen" style={{ left: '70px', top: '24px', fontSize: '20px', color: '#c9c2e8', transform: 'rotate(-6deg)' }}>꺼내 줘</span>
        </div>
        <div class="base">
          <div class="slot">{stage === 'drop' && <i class="falling-ball" style={{ background: ballColor }} />}</div>
          <button type="button" class={stage === 'turn' ? 'knob turning' : 'knob'} disabled={!canPull} aria-label={`캡슐 뽑기, 수당 ${GACHA.cost}`} onClick={pull}>
            {busy ? '덜컥…' : canPull ? '돌리기' : '수당 부족'}
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#d9cbe8' }}>
        <span>1회 <b class="money">{GACHA.cost}</b> · 가진 수당 <b class="money">{run.money}</b></span>
        <span>금색 확정까지 {GACHA.pity - run.pity}회</span>
      </div>

      {taeoReady && (
        <button type="button" class="btn-main" disabled={busy} style={{ background: '#a46bff' }} onClick={() => openStory('taeo-figure')}>
          특별 근무일 확정 캡슐 열기 (무료)
        </button>
      )}
      {blackReady && (
        <button type="button" class="btn-main" disabled={busy} style={{ background: '#0b0b12', color: 'var(--pink)', boxShadow: '0 0 0 3px var(--pink)' }} onClick={() => openStory('dalhee-0')}>
          검은 캡슐이 굴러 나왔다
        </button>
      )}
      {last && <PullResult key={`${last.item.id}-${run.draws}`} item={last.item} duplicate={last.duplicate} />}

      <button type="button" class="btn-sub" aria-expanded={showOdds} onClick={() => setShowOdds(!showOdds)}>
        {showOdds ? '확률 닫기' : '확률 보기'}
      </button>
      {showOdds && <OddsTable endings={run.endings} />}
    </>
  );
}

function PullResult({ item, duplicate }: { item: GachaItem; duplicate: boolean }) {
  const companion = COMPANIONS[item.id] ?? STORY_COMPANIONS[item.id];
  const relic = RELICS[item.id];
  return (
    <div class="pull" role="status">
      <div class="head">
        <div class="capsule-ball" style={{ background: item.id === 'dalhee-0' ? '#0b0b12' : GRADE_COLOR[item.grade] }} />
        <div>
          <div style={{ fontSize: '11px', color: '#d9cbe8' }}>{GRADE_LABEL[item.grade]} · {item.kind === 'companion' ? '동료' : item.kind === 'relic' ? '기념품' : '카드'}</div>
          <div style={{ fontSize: '17px', fontWeight: 700 }}>{item.name}</div>
        </div>
      </div>
      {companion && <div class="pen" style={{ color: 'var(--pink)', fontSize: '22px' }}>"{companion.capsuleLine}"</div>}
      {companion && <div>전용 카드 [{CARDS[companion.card].name}]이 덱에 들어갔다. 숙직실에서 대화할 수 있다.</div>}
      {relic && <div>{relic.good} · <span style={{ color: 'var(--pink)' }}>저주: {relic.curse}</span><br /><span style={{ color: '#d9cbe8' }}>{relic.story}</span></div>}
      {item.grantsCard && !companion && <div>[{CARDS[item.grantsCard].name}] 카드가 덱에 들어갔다.</div>}
      {duplicate && <div style={{ color: 'var(--gold)' }}>이미 있는 것이다. 수당 {GACHA.duplicateRefund}을 돌려받았다.</div>}
    </div>
  );
}

function OddsTable({ endings }: { endings: string[] }) {
  const pool = poolFor(GACHA, endings);
  const rows = itemRates(pool);
  return (
    <div style={{ overflowX: 'auto' }}>
      <table class="odds">
        <caption style={{ textAlign: 'left', fontSize: '11px', color: '#d9cbe8', padding: '4px 0' }}>
          등급 확률: {Object.entries(pool.rates).map(([g, r]) => `${GRADE_LABEL[g as keyof typeof GRADE_LABEL]} ${(r * 100).toFixed(0)}%`).join(' · ')}. 금색 없이 {GACHA.pity}회째에는 금색 확정.{pool.items.length < GACHA.items.length ? ' 아직 나오지 않는 것이 있다.' : ''}
        </caption>
        <thead>
          <tr><th>아이템</th><th>등급</th><th>확률</th></tr>
        </thead>
        <tbody>
          {rows.map(({ item, rate }) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{GRADE_LABEL[item.grade]}</td>
              <td>{(rate * 100).toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
