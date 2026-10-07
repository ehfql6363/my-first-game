import type { CardDef } from '../core/types';

export const CARDS: Record<string, CardDef> = {
  light: { id: 'light', name: '조명 끄기', cost: 1, kind: 'basic', response: 'light', desc: '이 구역 조명을 끈다' },
  lock: { id: 'lock', name: '문 잠그기', cost: 1, kind: 'basic', response: 'lock', desc: '이 구역 문을 잠근다' },
  ignore: { id: 'ignore', name: '방송 무시', cost: 0, kind: 'basic', response: 'ignore', desc: '들리지 않는 척한다' },
  zoom: { id: 'zoom', name: '카메라 확대', cost: 1, kind: 'basic', response: 'zoom', desc: '이번 턴 모든 카메라 이상 유무 확인' },
  laughter: { id: 'laughter', name: '웃음소리', cost: null, kind: 'curse', desc: '쓸 수 없다. 자리만 차지한다' },
  // 보상 카드
  'light-plus': { id: 'light-plus', name: '조명 끄기+', cost: 0, kind: 'basic', response: 'light', desc: '비용 없이 조명을 끈다' },
  'lock-plus': { id: 'lock-plus', name: '문 잠그기+', cost: 0, kind: 'basic', response: 'lock', desc: '비용 없이 문을 잠근다' },
  'zoom-plus': { id: 'zoom-plus', name: '카메라 확대+', cost: 0, kind: 'basic', response: 'zoom', desc: '비용 없이 모든 카메라 확인' },
  whistle: { id: 'whistle', name: '호루라기', cost: 2, kind: 'gear', response: 'any', desc: '이 카메라의 이상 현상 하나를 쫓아낸다' },
  coffee: { id: 'coffee', name: '보온병 커피', cost: 0, kind: 'gear', gainBattery: 1, desc: '배터리 +1. 식었다' },
  // 동료 카드 (캡슐 기계에서 동료를 구출하면 덱에 들어간다)
  patrol: { id: 'patrol', name: '대신 순찰', cost: 2, kind: 'ally', response: 'any', resolveAll: true, desc: '김반장. 이 카메라의 이상 현상을 전부 정리한다' },
  'mascot-act': { id: 'mascot-act', name: '같은 편인 척', cost: 1, kind: 'ally', response: 'light', anyCamera: true, desc: '하루. 어느 카메라든 조명 끄기 대응 하나' },
  wrench: { id: 'wrench', name: '렌치', cost: 1, kind: 'ally', response: 'lock', anyCamera: true, desc: '도윤. 어느 카메라든 문 잠그기 대응 하나' },
  'rule-reading': { id: 'rule-reading', name: '수칙 낭독', cost: 3, kind: 'ally', response: 'any', anyCamera: true, resolveAll: true, desc: '민지. 모든 카메라의 이상 현상을 정리 (보지 마십시오 제외)' },
  salt: { id: 'salt', name: '소금 뿌리기', cost: 1, kind: 'ally', purgeCurses: true, desc: '이옥순. 손에 든 웃음소리를 태워 이번 밤 동안 없앤다' },
  'night-shot': { id: 'night-shot', name: '야간 촬영', cost: 0, kind: 'ally', response: 'zoom', anyCamera: true, desc: '하은. 비용 없이 모든 카메라 확인 + 어느 카메라든 확대해 읽기' },
  'first-aid': { id: 'first-aid', name: '응급 처치', cost: 1, kind: 'ally', healRisk: 2, desc: '소라. 위험도 -2' },
  'vanish-trick': { id: 'vanish-trick', name: '사라지는 마술', cost: 1, kind: 'ally', draw: 2, desc: '복남. 카드 2장을 더 뽑는다' },
  lightstick: { id: 'lightstick', name: '응원봉', cost: 1, kind: 'ally', gainBattery: 2, desc: '유나. 배터리 +2 (실질 +1)' },
  'bare-fist': { id: 'bare-fist', name: '맨주먹', cost: 1, kind: 'ally', response: 'lock', resolveAll: true, desc: '강철. 이 카메라의 문 잠그기 대응을 전부' },
  // 스토리로 얻는 동료 카드 (가챠 아님)
  excuse: { id: 'excuse', name: '핑계 말풍선', cost: 0, kind: 'ally', response: 'ignore', anyCamera: true, desc: '태오. "죄송한데요!" 어느 카메라든 방송 무시 대응 하나' },
  'blank-tag': { id: 'blank-tag', name: '빈 이름표', cost: 1, kind: 'ally', response: 'any', anyCamera: true, desc: '0회차의 나. 어느 카메라든 이상 현상 하나를 지운다' },
};

export const STARTER_DECK: string[] = [
  ...Array(4).fill('light'),
  ...Array(4).fill('lock'),
  ...Array(3).fill('ignore'),
  ...Array(3).fill('zoom'),
];

/** 밤을 버틴 뒤 3장 중 1장을 고르는 보상 후보 */
export const REWARD_POOL: string[] = ['light-plus', 'lock-plus', 'zoom-plus', 'whistle', 'coffee'];
