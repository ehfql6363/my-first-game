import type { AnomalyDef, NightDef } from '../core/types';

// 2일차 · 회전목마. 7번 수칙이 거짓 (docs/story/rulebooks.md 2일차 설계 메모를 CCTV 방식으로 옮김)
// 40분 × 9턴

const a = (
  id: string,
  kind: string,
  cameraId: string,
  appearsAtTurn: number,
  requires: AnomalyDef['requires'],
  riskPerTurn: number,
  name: string,
  extra: Partial<AnomalyDef> = {},
): AnomalyDef => ({ id: `n2-${id}`, kind, cameraId, appearsAtTurn, requires, riskPerTurn, name, ...extra });

export const NIGHT_2: NightDef = {
  id: 'night-2',
  day: 2,
  minutesPerTurn: 40,
  startTurn: 0,
  endTurn: 9,
  cameras: [
    { id: 'gate', name: '정문 광장' },
    { id: 'ticket', name: '매표소' },
    { id: 'carousel', name: '회전목마' },
    { id: 'broadcast', name: '방송실' },
  ],
  anomalies: [
    a('1-smile', 'smile', 'carousel', 1, 'light', 1, '웃는 문루'),
    a('2-reverse', 'reverse', 'broadcast', 2, 'light', 2, '거꾸로 재생되는 음악'),
    a('3-balloon', 'balloon', 'ticket', 2, 'lock', 2, '매표소에 들어간 풍선 인형'),
    // 거짓 수칙(7번): 수칙은 "보내 주라"고 하지만, 정문을 잠가 붙잡으면 단서를 얻는다. 보내도 위험도는 오르지 않는다.
    a('4-taeo', 'taeo', 'gate', 3, 'lock', 0, '먼저 퇴근하려는 한태오', {
      expiresAtTurn: 5,
      clue: 'taeo-nametag',
      resolvedText: '정문 쪽 문을 잠갔다. 태오가 멈춰 서서 카메라를 올려다본다. …다음 순간 화면에 아무도 없다. 바닥에 이름표가 떨어져 있다.',
      expiredText: '정문 카메라: 태오가 웃으며 어둠 속으로 걸어갔다. 정문은 없는데.',
    }),
    a('5-horse', 'horse13', 'carousel', 3, 'lock', 2, '열세 번째 말'),
    a('6-namecall', 'namecall', 'broadcast', 4, 'ignore', 2, '이름을 부르는 방송'),
    a('7-balloon', 'balloon', 'ticket', 4, 'lock', 2, '매표소에 들어간 풍선 인형'),
    a('8-smile', 'smile', 'carousel', 5, 'light', 2, '웃는 문루'),
    a('9-reverse', 'reverse', 'broadcast', 6, 'light', 2, '거꾸로 재생되는 음악'),
    a('10-horse', 'horse13', 'carousel', 6, 'lock', 2, '열세 번째 말'),
    a('11-balloon', 'balloon', 'ticket', 7, 'lock', 2, '매표소에 들어간 풍선 인형'),
    a('12-smile', 'smile', 'carousel', 7, 'light', 2, '웃는 문루'),
  ],
  rules: [
    { no: 1, text: '어제 근무를 무사히 마치신 여러분, 축하합니다! 1일차 수칙은 계속 유효합니다.' },
    { no: 2, text: '회전목마에서 웃는 문루가 보이면 그 구역 조명을 끄십시오.', short: '웃는 문루 → 조명 끄기' },
    { no: 3, text: '매표소 안에 풍선 인형이 있으면 매표소 문을 잠그십시오.', short: '매표소 풍선 인형 → 문 잠그기' },
    { no: 4, text: '안내방송이 당신의 이름을 부르면 대답하지 마십시오.', short: '이름 부르는 방송 → 방송 무시' },
    { no: 5, text: '회전목마는 자정이 되면 혼자 돌기 시작합니다. 정상입니다. 말의 수를 세지 마십시오. 열세 번째 말이 보이면 회전목마 문을 잠그십시오.', short: '열세 번째 말 → 문 잠그기' },
    { no: 6, text: '음악이 거꾸로 재생되면 방송실 조명을 끄십시오. 따라 부르지 마십시오.', short: '거꾸로 음악 → 방송실 조명 끄기' },
    { no: 7, text: '동기가 "먼저 퇴근하겠다"고 하면 보내 주십시오. 붙잡지 마십시오.', short: '먼저 퇴근하는 동기 → 보내 주기' },
  ],
  memo: '7번은 믿지 마. 말은 원래 열두 마리야. — J',
};
