import type { AnomalyDef, NightDef } from '../core/types';

// 1일차 · 수칙은 전부 진실 (튜토리얼 밤). docs/story/rulebooks.md 1일차를 CCTV 방식에 맞게 옮김.
// 20분 단위 18턴 = 00:00 ~ 06:00

type Spawn = [turn: number, kind: 'smile' | 'balloon' | 'namecall'];

const KINDS = {
  smile: { name: '웃는 문루', cameraId: 'carousel', requires: 'light', riskPerTurn: 1 },
  balloon: { name: '매표소에 들어간 풍선 인형', cameraId: 'ticket', requires: 'lock', riskPerTurn: 1 },
  namecall: { name: '이름을 부르는 방송', cameraId: 'broadcast', requires: 'ignore', riskPerTurn: 2 },
} as const;

const SCHEDULE: Spawn[] = [
  [2, 'smile'],
  [4, 'balloon'],
  [6, 'namecall'],
  [8, 'smile'],
  [9, 'balloon'],
  [11, 'namecall'],
  [12, 'smile'],
  [14, 'balloon'],
  [15, 'namecall'],
  [16, 'smile'],
];

const anomalies: AnomalyDef[] = SCHEDULE.map(([turn, kind], i) => ({
  id: `n1-${i + 1}-${kind}`,
  kind,
  appearsAtTurn: turn,
  ...KINDS[kind],
}));

export const NIGHT_1: NightDef = {
  id: 'night-1',
  day: 1,
  minutesPerTurn: 20,
  startTurn: 0,
  endTurn: 18,
  cameras: [
    { id: 'gate', name: '정문 광장' },
    { id: 'ticket', name: '매표소' },
    { id: 'carousel', name: '회전목마' },
    { id: 'broadcast', name: '방송실' },
  ],
  anomalies,
  rules: [
    { no: 1, text: '근무 시간은 00:00부터 06:00까지입니다. 06:00 이전에 정문을 찾지 마십시오. 정문은 06:00 이전에는 존재하지 않습니다.' },
    { no: 2, text: '문루는 언제나 웃고 있습니다. 회전목마에서 웃는 문루가 보이면 그 구역 조명을 끄십시오.' },
    { no: 3, text: '풍선 인형은 직원이 아닙니다. 아직은. 풍선 인형이 매표소 안에 있으면 매표소 문을 잠그십시오.' },
    { no: 4, text: '안내방송이 당신의 이름을 부르면 대답하지 마십시오. 당신의 이름은 아직 등록되지 않았습니다.' },
    { no: 5, text: '동기의 수를 세지 마십시오.' },
  ],
};
