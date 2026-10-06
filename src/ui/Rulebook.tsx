import type { NightDef } from '../core/types';

interface Props {
  night: NightDef;
  suspected?: number[];
  /** 있으면 수칙마다 의심 표시 버튼이 생긴다 */
  onToggle?: (ruleNo: number) => void;
}

export function Rulebook({ night, suspected = [], onToggle }: Props) {
  return (
    <div class="paper">
      <div>
        <div class="company">월광관리(주) 해피문 랜드</div>
        <h2>야간 근무 수칙 ({night.day}일차)</h2>
      </div>
      <ol>
        {night.rules.map((r) => {
          const sus = suspected.includes(r.no);
          return (
            <li key={r.no} value={r.no}>
              <div class="rule-row">
                <span class={sus ? 'suspect' : undefined}>{r.text}</span>
                {onToggle && (
                  <button type="button" class={sus ? 'mark on' : 'mark'} aria-pressed={sus} aria-label={`${r.no}번 수칙 의심 표시`} onClick={() => onToggle(r.no)}>
                    {sus ? '의심' : '표시'}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {night.memo && <div class="pen memo">수칙서 뒷면: {night.memo}</div>}
      <div class="roster">
        금일 수습생: 수습생 (본인) · 서민지 · 한태오 · ＿＿＿＿
        <br />
        오늘 밤도 해피문 랜드와 함께 즐거운 근무 되세요!
      </div>
    </div>
  );
}
