import type { NightDef } from '../core/types';

export function Rulebook({ night }: { night: NightDef }) {
  return (
    <div class="paper">
      <div>
        <div class="company">월광관리(주) 해피문 랜드</div>
        <h2>야간 근무 수칙 ({night.day}일차)</h2>
      </div>
      <ol>
        {night.rules.map((r) => (
          <li key={r.no} value={r.no}>{r.text}</li>
        ))}
      </ol>
      <div class="roster">
        금일 수습생: 수습생 (본인) · 서민지 · 한태오 · ＿＿＿＿
        <br />
        오늘 밤도 해피문 랜드와 함께 즐거운 근무 되세요!
      </div>
    </div>
  );
}
