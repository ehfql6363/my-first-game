import type { NightDef } from '../core/types';
import { anomalyMaker } from './anomaly';

// 7일차 · 마지막 퍼레이드. "당신이 수칙입니다." 수칙이 전부 플레이어 글씨. 2번(대답한다)이 거짓.
// 06:00까지 버티면 엔딩을 고른다 (src/data/endings.ts). 방송은 두 턴 동안 부르다 멈춘다 (대답하지 않으면 그만큼 위험).
const a = anomalyMaker('n7');

export const NIGHT_7: NightDef = {
  id: 'night-7',
  day: 7,
  minutesPerTurn: 40,
  startTurn: 0,
  endTurn: 9,
  handwritten: true,
  cameras: [
    { id: 'gate', name: '정문 광장' },
    { id: 'parade', name: '퍼레이드 거리' },
    { id: 'tunnel', name: '지하 정비 터널' },
    { id: 'broadcast', name: '방송실' },
  ],
  anomalies: [
    a('1-parade', 'parade', 'parade', 1, 'light', 2, '마지막 퍼레이드 행렬'),
    a('2-call', 'namecall', 'broadcast', 1, 'ignore', 2, '내 이름을 정확히 부르는 방송', { expiresAtTurn: 3 }),
    a('3-face', 'knownface', 'parade', 2, 'any', 3, '행렬 속 아는 얼굴', { gaze: true, expiresAtTurn: 4 }),
    a('4-whisper', 'whisper', 'tunnel', 2, 'lock', 2, '터널의 속삭임'),
    a('5-guard', 'guardface', 'gate', 3, 'any', 3, '이쪽을 보는 경비원', { gaze: true, expiresAtTurn: 5 }),
    a('6-call', 'namecall', 'broadcast', 3, 'ignore', 2, '내 이름을 정확히 부르는 방송', { expiresAtTurn: 5 }),
    a('7-parade', 'parade', 'parade', 4, 'light', 2, '마지막 퍼레이드 행렬'),
    a('8-whisper', 'whisper', 'tunnel', 4, 'lock', 2, '터널의 속삭임'),
    a('9-call', 'namecall', 'broadcast', 5, 'ignore', 3, '내 이름을 정확히 부르는 방송', { expiresAtTurn: 7 }),
    a('10-face', 'knownface', 'parade', 5, 'any', 3, '행렬 속 아는 얼굴', { gaze: true, expiresAtTurn: 7 }),
    a('11-parade', 'parade', 'parade', 6, 'light', 2, '마지막 퍼레이드 행렬'),
    a('12-guard', 'guardface', 'gate', 6, 'any', 3, '이쪽을 보는 경비원', { gaze: true, expiresAtTurn: 8 }),
    a('13-call', 'namecall', 'broadcast', 7, 'ignore', 3, '내 이름을 정확히 부르는 방송', { expiresAtTurn: 9 }),
    a('14-whisper', 'whisper', 'tunnel', 7, 'lock', 2, '터널의 속삭임'),
  ],
  rules: [
    { no: 1, text: '퍼레이드가 끝날 때까지 웃는다.', short: '행렬 → 조명 끄기' },
    { no: 2, text: '방송이 내 이름을 부르면 대답한다.', short: '방송이 이름을 부르면 → 대답한다?' },
    { no: 3, text: '정문은 06:00에 나타난다. 터널이 속삭이면 문을 잠근다.', short: '속삭임 → 터널 문 잠그기' },
    { no: 4, text: '민지는 두고 간다.' },
    { no: 5, text: '████████을 부른다.' },
  ],
  restored: [{ ruleNo: 5, clue: 'own-name', text: '내 이름을 부른다.' }],
  memo: '마지막 근무입니다. 오늘은 수칙이 없습니다. 당신이 수칙입니다. 내일부터는 출근하지 않으셔도 됩니다. 당신은 이미 여기 있으니까요. ☾',
};
