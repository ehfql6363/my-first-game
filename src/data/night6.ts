import type { NightDef } from '../core/types';
import { anomalyMaker } from './anomaly';

// 6일차 · 지하 정비 터널. 2번·4번이 거짓. 플레이어의 이름이 처음 드러나는 밤.
const a = anomalyMaker('n6');

export const NIGHT_6: NightDef = {
  id: 'night-6',
  day: 6,
  minutesPerTurn: 40,
  startTurn: 0,
  endTurn: 9,
  cameras: [
    { id: 'gate', name: '정문 광장' },
    { id: 'parade', name: '퍼레이드 거리' },
    { id: 'tunnel', name: '지하 정비 터널' },
    { id: 'broadcast', name: '방송실' },
  ],
  anomalies: [
    a('1-parade', 'parade', 'parade', 1, 'light', 2, '지나가는 퍼레이드 행렬'),
    a('2-whisper', 'whisper', 'tunnel', 1, 'lock', 2, '터널의 속삭임'),
    a('3-wall', 'wallnames', 'tunnel', 2, 'zoom', 0, '벽에 적힌 이름들', {
      expiresAtTurn: 6,
      clue: 'own-name',
      resolvedText: '벽 맨 아래 이름을 확대했다. 윤달희. …벽 속에서 내 목소리가 대답했다. "…응?"',
    }),
    a('4-guard', 'guardface', 'gate', 2, 'any', 3, '이쪽을 보는 경비원', { gaze: true, expiresAtTurn: 4 }),
    a('5-namecall', 'namecall', 'broadcast', 3, 'ignore', 2, '이름을 부르는 방송'),
    a('6-door', 'tunneldoor', 'tunnel', 4, 'zoom', 0, '터널 끝의 문', {
      expiresAtTurn: 7,
      clue: 'capsule-core',
      resolvedText: '문틈을 확대했다. 캡슐이 천장까지 쌓여 있다. 작은 손들이 유리를 두드린다.',
    }),
    a('7-parade', 'parade', 'parade', 4, 'light', 2, '지나가는 퍼레이드 행렬'),
    a('8-whisper', 'whisper', 'tunnel', 5, 'lock', 2, '터널의 속삭임'),
    a('9-guard', 'guardface', 'gate', 5, 'any', 3, '이쪽을 보는 경비원', { gaze: true, expiresAtTurn: 7 }),
    a('10-parade', 'parade', 'parade', 6, 'light', 2, '지나가는 퍼레이드 행렬'),
    a('11-namecall', 'namecall', 'broadcast', 6, 'ignore', 2, '이름을 부르는 방송'),
    a('12-whisper', 'whisper', 'tunnel', 7, 'lock', 2, '터널의 속삭임'),
  ],
  rules: [
    { no: 1, text: '터널 안에서는 수칙서를 읽지 마십시오.' },
    { no: 2, text: '벽에 적힌 이름을 확대해서 읽지 마십시오. 읽으면 그 사람이 대답합니다.', short: '벽의 이름 → 확대하지 않기' },
    { no: 3, text: '서민지 정규직 예정자를 방해하지 마십시오.' },
    { no: 4, text: '터널 끝의 문 뒤에는 아무것도 없습니다. 들여다보지 마십시오.', short: '터널 끝의 문 → 보지 않기' },
    { no: 5, text: '당신의 이름을 기억하십니까? 기억하지 못해도 괜찮습니다. 저희가 기억하고 있습니다.' },
    { no: 6, text: '터널에서 속삭임이 들리면 터널 문을 잠그십시오. 대답하지 마십시오. 정문 아래 경비원이 이쪽을 보면 그 화면을 보지 마십시오.', short: '속삭임 → 터널 문 잠그기 · 이쪽 보는 경비원 → 보지 않기' },
    { no: 7, text: '퍼레이드 수칙은 계속 유효합니다.', short: '퍼레이드 행렬 → 조명 끄기' },
  ],
  memo: '나는 7일째에 정규직이 됐어. 이 쪽지는 탈 안에서 쓰고 있어. 벽 맨 아래 이름을 읽어 줘. 그건 네 이름이야. 너는 10년 동안 매일 처음 출근했어. — J',
};
