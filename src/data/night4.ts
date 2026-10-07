import type { NightDef } from '../core/types';
import { anomalyMaker } from './anomaly';

// 4일차 · 대관람차. 2번이 거짓(꼭대기 칸을 확대하면 사진). 5번은 문장이 끊겨 있다.
const a = anomalyMaker('n4');

export const NIGHT_4: NightDef = {
  id: 'night-4',
  day: 4,
  minutesPerTurn: 40,
  startTurn: 0,
  endTurn: 9,
  cameras: [
    { id: 'gate', name: '정문 광장' },
    { id: 'haunted', name: '유령의 집' },
    { id: 'ferris', name: '대관람차' },
    { id: 'broadcast', name: '방송실' },
  ],
  anomalies: [
    a('1-fast', 'wheelfast', 'ferris', 1, 'lock', 2, '너무 빨리 도는 대관람차'),
    a('2-ghost', 'ghost', 'haunted', 1, 'ignore', 1, '유령 직원'),
    a('3-star', 'star', 'gate', 2, 'light', 2, '내려오는 별'),
    a('4-passenger', 'passenger', 'ferris', 2, 'any', 2, '다른 칸의 사람', { gaze: true, expiresAtTurn: 4 }),
    // 거짓 수칙(2번): 꼭대기 칸을 확대하면 사진. 안 봐도 위험하지 않다.
    a('5-top', 'topcar', 'ferris', 3, 'zoom', 0, '꼭대기 칸', {
      expiresAtTurn: 6,
      clue: 'parade-photo',
      resolvedText: '꼭대기 칸을 확대했다. 위에서 본 공원은… 웃는 얼굴 모양이다. 의자 밑에 사진 한 장.',
    }),
    a('6-namecall', 'namecall', 'broadcast', 3, 'ignore', 2, '이름을 부르는 방송'),
    a('7-door', 'staffdoor', 'haunted', 4, 'lock', 1, '열린 문'),
    a('8-fast', 'wheelfast', 'ferris', 5, 'lock', 2, '너무 빨리 도는 대관람차'),
    a('9-star', 'star', 'gate', 5, 'light', 2, '내려오는 별'),
    a('10-passenger', 'passenger', 'ferris', 6, 'any', 2, '다른 칸의 사람', { gaze: true, expiresAtTurn: 8 }),
    a('11-ghost', 'ghost', 'haunted', 6, 'ignore', 1, '유령 직원'),
    a('12-namecall', 'namecall', 'broadcast', 7, 'ignore', 2, '이름을 부르는 방송'),
  ],
  rules: [
    { no: 1, text: '대관람차는 한 바퀴에 60분 걸립니다. 그보다 빨리 돌면 대관람차 문을 잠가 멈추십시오.', short: '빨리 도는 대관람차 → 문 잠그기' },
    { no: 2, text: '꼭대기 칸을 확대해서 보지 마십시오. 공원은 위에서 보면 다르게 생겼습니다.', short: '꼭대기 칸 → 확대하지 않기' },
    { no: 3, text: '다른 칸에 탄 사람과 눈을 마주치지 마십시오. 모든 칸은 비어 있습니다.', short: '다른 칸의 사람 → 그 화면 보지 않기' },
    { no: 4, text: '10년 전 일에 대해 묻는 직원이 있다면 방송실에 알려 주십시오. 방송실은 듣고 있습니다.' },
    { no: 5, text: '별이 보이면 정상입니다. 별이 깜빡이면 정상입니다. 별이 당신을 향해 내려오면', short: '내려오는 별 → ?' },
    { no: 6, text: '서민지 수습생이 우수 수습생으로 선정되었습니다. 모두 축하해 주십시오!' },
    { no: 7, text: '유령의 집 수칙(유령 직원, 열린 문)은 계속 유효합니다.', short: '유령 직원 → 방송 무시 · 열린 문 → 잠그기' },
  ],
  memo: '내려다봐. 그래야 알아. 별한테는 불을 꺼. 빛을 보고 내려오니까. — J',
};
