import type { NightDef } from '../core/types';

interface Props {
  night: NightDef;
  suspected?: number[];
  /** 있으면 수칙마다 의심 표시 버튼이 생긴다 */
  onToggle?: (ruleNo: number) => void;
  /** 이전 회차의 '내 글씨' 메모 */
  myMemos?: string[];
  /** 가진 단서 (지워진 수칙 복원, 명부 변화) */
  clues?: string[];
}

export function Rulebook({ night, suspected = [], onToggle, myMemos = [], clues = [] }: Props) {
  const textOf = (no: number, text: string) => night.restored?.find((r) => r.ruleNo === no && clues.includes(r.clue))?.text ?? text;
  const knowsName = clues.includes('own-name');
  return (
    <div class={night.handwritten ? 'paper handwritten' : 'paper'}>
      <div>
        <div class="company">월광관리(주) 해피문 랜드</div>
        <h2>야간 근무 수칙 ({night.day}일차){night.handwritten ? ' — 당신이 수칙입니다' : ''}</h2>
      </div>
      <ol>
        {night.rules.map((r) => {
          const sus = suspected.includes(r.no);
          return (
            <li key={r.no} value={r.no}>
              <div class="rule-row">
                <span class={sus ? 'suspect' : undefined}>{textOf(r.no, r.text)}</span>
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
      {myMemos.map((m) => (
        <div key={m} class="pen my-memo">{m}</div>
      ))}
      <div class="roster">
        금일 수습생: {knowsName ? <s>수습생 (본인)</s> : '수습생 (본인)'} · 서민지 · {night.day >= 3 ? '한태오 (퇴사)' : '한태오'} · {knowsName ? '윤달희' : '＿＿＿＿'}
        <br />
        오늘 밤도 해피문 랜드와 함께 즐거운 근무 되세요!
      </div>
    </div>
  );
}
