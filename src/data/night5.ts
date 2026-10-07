import type { NightDef } from '../core/types';
import { anomalyMaker } from './anomaly';

// 5일차 · 퍼레이드 거리. 특별 근무일(수당 2배). 5번은 낮의 캡슐 동료 대화에 걸린 거짓 수칙.
const a = anomalyMaker('n5');

export const NIGHT_5: NightDef = {
  id: 'night-5',
  day: 5,
  minutesPerTurn: 40,
  startTurn: 0,
  endTurn: 9,
  payBonus: 1,
  cameras: [
    { id: 'gate', name: '정문 광장' },
    { id: 'ferris', name: '대관람차' },
    { id: 'parade', name: '퍼레이드 거리' },
    { id: 'broadcast', name: '방송실' },
  ],
  anomalies: [
    a('1-parade', 'parade', 'parade', 1, 'light', 2, '지나가는 퍼레이드 행렬'),
    a('2-namecall', 'namecall', 'broadcast', 1, 'ignore', 2, '이름을 부르는 방송'),
    a('3-fast', 'wheelfast', 'ferris', 2, 'lock', 2, '너무 빨리 도는 대관람차'),
    a('4-face', 'knownface', 'parade', 2, 'any', 3, '행렬 속 아는 얼굴', { gaze: true, expiresAtTurn: 4 }),
    a('5-star', 'star', 'gate', 3, 'light', 2, '내려오는 별'),
    a('6-parade', 'parade', 'parade', 4, 'light', 2, '지나가는 퍼레이드 행렬'),
    a('7-passenger', 'passenger', 'ferris', 4, 'any', 2, '다른 칸의 사람', { gaze: true, expiresAtTurn: 6 }),
    a('8-namecall', 'namecall', 'broadcast', 5, 'ignore', 2, '이름을 부르는 방송'),
    a('9-face', 'knownface', 'parade', 5, 'any', 3, '행렬 속 아는 얼굴', { gaze: true, expiresAtTurn: 7 }),
    a('10-parade', 'parade', 'parade', 6, 'light', 2, '지나가는 퍼레이드 행렬'),
    a('11-star', 'star', 'gate', 6, 'light', 2, '내려오는 별'),
    a('12-fast', 'wheelfast', 'ferris', 7, 'lock', 2, '너무 빨리 도는 대관람차'),
  ],
  rules: [
    { no: 1, text: '오늘은 특별 근무일입니다! 근무 수당이 2배 지급됩니다. 캡슐 기계도 특별 운영합니다. 모두가 기다리고 있습니다.' },
    { no: 2, text: '퍼레이드 행렬이 지나가면 퍼레이드 거리 조명을 끄십시오. 행렬은 어두운 곳을 지나가지 않습니다.', short: '퍼레이드 행렬 → 조명 끄기' },
    { no: 3, text: '행렬 속에 아는 얼굴이 있어도 부르지 마십시오. 그 화면을 오래 보지 마십시오.', short: '아는 얼굴 → 그 화면 보지 않기' },
    { no: 4, text: '캡슐 기계에서 나온 동료는 반품할 수 없습니다.' },
    { no: 5, text: '캡슐 속 동료가 말을 걸면 대답해도 됩니다. 그들은 행복합니다.' },
    { no: 6, text: '대관람차와 별에 관한 수칙은 계속 유효합니다.', short: '빨리 도는 대관람차 → 잠그기 · 별 → 조명 끄기' },
  ],
  loopMemos: [
    { minLoop: 1, text: '6. 나는 여기 오기 전에 무슨 일을 했었지?' },
    { minLoop: 1, clue: 'taeo-nametag', text: '7. 태오야 미안해' },
  ],
};
