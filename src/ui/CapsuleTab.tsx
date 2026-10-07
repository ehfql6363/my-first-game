import { useState } from 'preact/hooks';
import { itemRates, type GachaItem } from '../core/gacha';
import { pullCapsule, type RunState } from '../core/run';
import { CARDS } from '../data/cards';
import { COMPANIONS } from '../data/companions';
import { GACHA, GRADE_COLOR, GRADE_LABEL } from '../data/gacha';
import { RELICS } from '../data/relics';
import { play as sfx } from './sound';

const BALLS: [string, string, string][] = [
  ['18px', '96px', GRADE_COLOR.white], ['50px', '110px', GRADE_COLOR.blue], ['82px', '98px', GRADE_COLOR.white], ['114px', '112px', GRADE_COLOR.purple],
  ['146px', '96px', GRADE_COLOR.white], ['178px', '108px', GRADE_COLOR.blue], ['40px', '70px', GRADE_COLOR.white], ['74px', '74px', GRADE_COLOR.gold],
  ['108px', '66px', GRADE_COLOR.blue], ['142px', '72px', '#0b0b12'],
];

export function CapsuleTab({ run, onChange }: { run: RunState; onChange: (run: RunState) => void }) {
  const [last, setLast] = useState<{ item: GachaItem; duplicate: boolean } | null>(null);
  const [showOdds, setShowOdds] = useState(false);
  const canPull = run.money >= GACHA.cost;

  function pull() {
    const r = pullCapsule(run, GACHA);
    if (!r) return;
    sfx('capsule');
    if (r.item.grade === 'gold') sfx('gold');
    setLast({ item: r.item, duplicate: r.duplicate });
    onChange(r.run);
  }

  return (
    <>
      <div class="machine">
        <div class="dome" aria-hidden="true">
          {BALLS.map(([l, t, c], i) => (
            <i key={i} style={{ left: l, top: t, background: c }} />
          ))}
          <span class="abs pen" style={{ left: '70px', top: '24px', fontSize: '20px', color: '#c9c2e8', transform: 'rotate(-6deg)' }}>꺼내 줘</span>
        </div>
        <div class="base">
          <div class="slot" />
          <button type="button" class="knob" disabled={!canPull} aria-label={`캡슐 뽑기, 수당 ${GACHA.cost}`} onClick={pull}>
            {canPull ? '돌리기' : '수당 부족'}
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#d9cbe8' }}>
        <span>1회 <b class="money">{GACHA.cost}</b> · 가진 수당 <b class="money">{run.money}</b></span>
        <span>금색 확정까지 {GACHA.pity - run.pity}회</span>
      </div>

      {last && <PullResult item={last.item} duplicate={last.duplicate} />}

      <button type="button" class="btn-sub" aria-expanded={showOdds} onClick={() => setShowOdds(!showOdds)}>
        {showOdds ? '확률 닫기' : '확률 보기'}
      </button>
      {showOdds && <OddsTable />}
    </>
  );
}

function PullResult({ item, duplicate }: { item: GachaItem; duplicate: boolean }) {
  const companion = COMPANIONS[item.id];
  const relic = RELICS[item.id];
  return (
    <div class="pull" role="status">
      <div class="head">
        <div class="capsule-ball" style={{ background: GRADE_COLOR[item.grade] }} />
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

function OddsTable() {
  const rows = itemRates(GACHA);
  return (
    <div style={{ overflowX: 'auto' }}>
      <table class="odds">
        <caption style={{ textAlign: 'left', fontSize: '11px', color: '#d9cbe8', padding: '4px 0' }}>
          등급 확률: {Object.entries(GACHA.rates).map(([g, r]) => `${GRADE_LABEL[g as keyof typeof GRADE_LABEL]} ${(r * 100).toFixed(0)}%`).join(' · ')}. 금색 없이 {GACHA.pity}회째에는 금색 확정.
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
