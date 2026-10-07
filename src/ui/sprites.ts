// 도트 스프라이트. 한 글자 = 한 픽셀, '.' = 투명. 색은 PALETTE (docs/design/ui-v0.md 팔레트 기반).

export const PALETTE: Record<string, string> = {
  K: '#0b0f26', // 윤곽
  W: '#f4f1ea', // 흰색
  w: '#c9c2b0', // 흰색 그늘
  P: '#ff6fae', // 네온 핑크
  R: '#8a1f33', // 입
  B: '#e7a3c0', // 풍선
  b: '#b7708f', // 풍선 그늘
  G: '#5a8f80', // 회전목마 말
  g: '#3f6e62',
  M: '#6ff2c8', // 경비복 민트
  m: '#36b48f',
  S: '#f0c8a0', // 피부
  V: '#a07bd6', // 태오 점퍼
  v: '#6d4fa0',
  Y: '#ffd76a', // 금색
};

export type Sprite = readonly string[];

/** 문루: 토끼 + 달. 언제나 웃고 있다 */
export const MOONROO: Sprite = [
  '...KK......KK...',
  '..KWWK....KWWK..',
  '..KWPK....KPWK..',
  '..KWPK....KPWK..',
  '..KWWKKKKKKWWK..',
  '.KWWWWWWWWWWWWK.',
  'KWWWWWWWWWWWWWWK',
  'KWWKKWWWWWWKKWWK',
  'KWWKPWWWWWWKPWWK',
  'KWWWWWWWWWWWWWWK',
  'KWRWWWWWWWWWWRWK',
  'KWWRRRRRRRRRRWWK',
  'KwWWRRRRRRRRWWwK',
  '.KwwWWWWWWWWwwK.',
  '..KKwwwwwwwwKK..',
  '....KKKKKKKK....',
];

/** 바람 빠진 풍선 인형 */
export const BALLOON: Sprite = [
  '...KKKKKK...',
  '..KBBBBBBK..',
  '.KBBBBBBBbK.',
  '.KBKBBBBKbK.',
  '.KBBBBBBBbK.',
  '.KBBKKKKBbK.',
  '.KBBBBBBBbK.',
  '..KbbbbbbK..',
  '...KKKKKK...',
  '.....KK.....',
  '......K.....',
  '.....K......',
  '......K.....',
];

/** 열세 번째 말. 눈이 핑크다 */
export const HORSE: Sprite = [
  '..KK............',
  '.KGGK...........',
  'KGPGGK..........',
  'KGGGGGKKKKKKK...',
  '.KKGGGGGGGGGGK..',
  '...KGGGGGGGGGgK.',
  '...KGGGGGGGGGgK.',
  '....KgggggggggK.',
  '....KgK.KgK.KgK.',
  '....KgK.KgK.KgK.',
  '....KK..KK..KK..',
];

/** 정문 아래 서 있는 경비원. 등을 돌리고 있다 */
export const GUARD_BACK: Sprite = [
  '..KKKK..',
  '.KMMMMK.',
  '.KKKKKK.',
  '.KKKKKK.',
  '..KSSK..',
  '.KMMMMK.',
  'KMMMMMMK',
  'KMMmmMMK',
  'KMMMMMMK',
  '.KMMMMK.',
  '.KmmmmK.',
  '.Km..mK.',
  '.Km..mK.',
  '.KK..KK.',
];

/** 먼저 퇴근하려는 한태오. 웃고 있다 */
export const TAEO: Sprite = [
  '..KKKK..',
  '.KKKKKK.',
  '.KSSSSK.',
  '.KKSSKK.',
  '.KSRRSK.',
  '..KSSK..',
  '.KVVVVK.',
  'KVVVVVVK',
  'KVVvvVVK',
  'KVVVVVVK',
  '.KVVVVK.',
  '.KvvvvK.',
  '.Kv..vK.',
  '.KK..KK.',
];

/** 유령의 집 직원. 이불을 뒤집어쓴 것 같은데 이름표를 달고 있다 */
export const GHOST: Sprite = [
  '...KKKKKK...',
  '..KWWWWWWK..',
  '.KWWWWWWWWK.',
  '.KWKKWWKKWK.',
  '.KWKPWWKPWK.',
  '.KWWWWWWWWK.',
  '.KWWWRRWWWK.',
  '.KWWWWWWWWK.',
  '.KWYYWWWWWK.',
  '.KWWWWWWWWK.',
  '.KWKWWKWWKK.',
  '.KK.KK.KK...',
];

/** 내려오는 별 */
export const STAR: Sprite = [
  '....Y....',
  '....Y....',
  '...YYY...',
  'YYYYPYYYY',
  '.YYYYYYY.',
  '..YYYYY..',
  '..YY.YY..',
  '.YY...YY.',
];

/** 이쪽을 보는 경비원 (거울 속의 나, 정문 아래 경비원) */
export const GUARD_FRONT: Sprite = [
  '..KKKK..',
  '.KMMMMK.',
  '.KKKKKK.',
  '.KSSSSK.',
  '.KKSSKK.',
  '.KSRRSK.',
  '..KSSK..',
  '.KMMMMK.',
  'KMMMMMMK',
  'KMMYMMMK',
  'KMMMMMMK',
  '.KmmmmK.',
  '.Km..mK.',
  '.KK..KK.',
];

/** 문루가 내민 배터리 */
export const BATTERY: Sprite = [
  '.KKKK.',
  'KYYYYK',
  'KYYYYK',
  'KYPPYK',
  'KYYYYK',
  'KYYYYK',
  '.KKKK.',
];
