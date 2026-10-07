import type { NightDef } from '../core/types';
import { anomalyMaker } from './anomaly';

// 3일차 · 유령의 집. 6번이 거짓. J의 메모 하나(두 번째 출구)도 틀렸다. (docs/story/rulebooks.md 3일차)
const a = anomalyMaker('n3');
const offer = {
  expiresAtTurn: 0,
  clue: 'j-memo',
  onExpire: { battery: 2, debt: 1 },
  resolvedText: '회전목마 문을 잠갔다. 문루가 배터리를 든 채로 오래 서 있다가 돌아갔다. 문틈에 쪽지가 끼워져 있다.',
  expiredText: '문루가 경비실 앞에 배터리를 두고 갔다. 다음 턴 배터리 +2. …갚아야 할 것 같은 기분이 든다.',
};

export const NIGHT_3: NightDef = {
  id: 'night-3',
  day: 3,
  minutesPerTurn: 40,
  startTurn: 0,
  endTurn: 9,
  cameras: [
    { id: 'gate', name: '정문 광장' },
    { id: 'haunted', name: '유령의 집' },
    { id: 'carousel', name: '회전목마' },
    { id: 'broadcast', name: '방송실' },
  ],
  anomalies: [
    a('1-ghost', 'ghost', 'haunted', 1, 'ignore', 1, '유령 직원'),
    a('2-smile', 'smile', 'carousel', 1, 'light', 1, '웃는 문루'),
    // 거짓 수칙(6번): 받으면(내버려 두면) 배터리를 얻지만 문루 빚이 생긴다. 문을 잠가 거절하면 J의 쪽지.
    a('3-offer', 'offer', 'carousel', 2, 'lock', 0, '배터리를 내미는 문루', { ...offer, expiresAtTurn: 4 }),
    a('4-mirror', 'mirror', 'haunted', 2, 'any', 2, '먼저 움직이는 거울', { gaze: true, expiresAtTurn: 4 }),
    // J의 메모는 "두 번째 출구로 가"라고 하지만 수칙(5번)이 맞다
    a('5-exit', 'exit2', 'gate', 3, 'lock', 2, '두 번째 출구'),
    a('6-namecall', 'namecall', 'broadcast', 3, 'ignore', 2, '이름을 부르는 방송'),
    a('7-door', 'staffdoor', 'haunted', 4, 'lock', 1, '열린 문'),
    a('8-ghost', 'ghost', 'haunted', 5, 'ignore', 1, '유령 직원'),
    a('9-offer', 'offer', 'carousel', 5, 'lock', 0, '배터리를 내미는 문루', { ...offer, expiresAtTurn: 7 }),
    a('10-mirror', 'mirror', 'haunted', 6, 'any', 2, '먼저 움직이는 거울', { gaze: true, expiresAtTurn: 8 }),
    a('11-smile', 'smile', 'carousel', 6, 'light', 1, '웃는 문루'),
    a('12-exit', 'exit2', 'gate', 7, 'lock', 2, '두 번째 출구'),
  ],
  rules: [
    { no: 1, text: '유령의 집의 유령은 모두 직원입니다. 놀라지 마십시오. 유령 직원이 보이면 못 본 척하십시오.', short: '유령 직원 → 방송 무시' },
    { no: 2, text: '거울에 비친 당신이 먼저 움직이면, 그 거울을 다시 보지 마십시오.', short: '먼저 움직이는 거울 → 그 화면 보지 않기' },
    { no: 3, text: '████████████████ 문을 열지 마십시오. 문이 열려 있으면 잠그십시오.', short: '열린 문 → 문 잠그기' },
    { no: 4, text: '한태오 수습생은 어제부로 퇴사 처리되었습니다. 찾지 마십시오.' },
    { no: 5, text: '유령의 집 출구는 한 개입니다. 두 번째 출구가 보이면 그것은 출구가 아닙니다. 막으십시오.', short: '두 번째 출구 → 문 잠그기' },
    { no: 6, text: '손전등 배터리가 부족하면 문루에게 요청하십시오. 문루가 배터리를 내밀면 받으십시오. 문루는 친절합니다.', short: '배터리 내미는 문루 → 받기' },
  ],
  restored: [{ ruleNo: 3, clue: 'j-memo', text: "'직원 전용'이라고 적힌 문을 열지 마십시오. 문이 열려 있으면 잠그십시오." }],
  memo: '두 번째 출구로 가. 거기가 진짜야. 진짜야. 진짜야. 진짜야. / 6번 하지 마. 문루한테 뭘 받으면 갚아야 돼.',
  loopMemos: [{ minLoop: 2, text: '진짜야가 네 번 적힌 줄은 J 글씨가 아니야. 잉크가 달라.' }],
};
