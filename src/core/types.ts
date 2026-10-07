// 게임 규칙에 쓰이는 타입. DOM이나 화면 코드는 여기 들어오지 않는다.

/** any = 어떤 이상 현상에도 대응 가능한 카드 */
export type ResponseId = 'light' | 'lock' | 'ignore' | 'zoom' | 'any';
export type CardKind = 'basic' | 'gear' | 'ally' | 'curse';

export interface CardDef {
  id: string;
  name: string;
  /** null = 낼 수 없는 카드 (저주) */
  cost: number | null;
  kind: CardKind;
  desc: string;
  /** 이 카드가 해결할 수 있는 대응 종류 */
  response?: ResponseId;
  /** 낼 때 얻는 배터리 */
  gainBattery?: number;
  /** 지금 보는 카메라가 아니어도 대응 (해당 이상 현상이 있는 아무 카메라) */
  anyCamera?: boolean;
  /** 지금 보는 카메라의 맞는 이상 현상을 전부 해결 */
  resolveAll?: boolean;
  /** 손에 든 저주 카드를 이번 밤 동안 태워 없앤다 */
  purgeCurses?: boolean;
  /** 위험도를 이만큼 낮춘다 */
  healRisk?: number;
  /** 카드를 이만큼 더 뽑는다 */
  draw?: number;
}

export interface CameraDef {
  id: string;
  name: string;
}

export interface AnomalyDef {
  id: string;
  name: string;
  /** 화면에 어떤 모습으로 그릴지 (같은 종류는 같은 그림) */
  kind: string;
  cameraId: string;
  /** 이 턴부터 카메라에 나타난다 */
  appearsAtTurn: number;
  /** 이 턴이 되면 사라진다 (대응하지 않았어도). 없으면 해결할 때까지 남는다 */
  expiresAtTurn?: number;
  /** 수칙상 올바른 대응. 거짓 수칙이 걸린 이상 현상이면 '진짜' 올바른 대응 */
  requires: ResponseId;
  /** 대응하지 않은 채 턴이 끝날 때마다 오르는 위험도 */
  riskPerTurn: number;
  /** "보지 마십시오": 턴이 끝날 때 이 카메라를 보고 있을 때만 위험도가 오른다. 대응으로 사라지지 않고 기한까지 남는다 */
  gaze?: boolean;
  /** 대응하지 않고 기한이 지나 사라질 때 생기는 일 (다음 턴 배터리, 문루 빚) */
  onExpire?: { battery?: number; debt?: number };
  /** 해결하면 얻는 단서 id (거짓 수칙을 간파했을 때의 보상) */
  clue?: string;
  /** 해결했을 때 / 그냥 사라졌을 때 보여 줄 문장 */
  resolvedText?: string;
  expiredText?: string;
}

export interface RuleText {
  no: number;
  text: string;
  /** 경비실 화면 띠에 보일 짧은 문장. 없으면 띠에 표시하지 않음 */
  short?: string;
}

export interface NightDef {
  id: string;
  day: number;
  /** 한 턴이 흐르는 게임 속 시간(분). 00:00부터 센다 */
  minutesPerTurn: number;
  startTurn: number;
  /** 이 턴에 도달하면 생존 (06:00) */
  endTurn: number;
  cameras: CameraDef[];
  anomalies: AnomalyDef[];
  /** 수칙서에 보이는 문장. 판정은 anomalies가 한다 */
  rules: RuleText[];
  /** 수칙서 뒷면 손글씨 */
  memo?: string;
  /** 이 밤의 수당 보너스 (1 = +100%) */
  payBonus?: number;
  /** 수칙이 전부 플레이어 글씨로 적혀 있는 밤 (7일차) */
  handwritten?: boolean;
  /** 단서가 있으면 지워진 수칙 문장이 복원된다 */
  restored?: { ruleNo: number; clue: string; text: string }[];
  /** 다시 출근했을 때 수칙서에 나타나는 '내 글씨' 메모. 조건을 만족할 때만 */
  loopMemos?: { minLoop: number; clue?: string; text: string }[];
}

export type NightOutcome = 'playing' | 'survived' | 'failed';

export interface NightState {
  turn: number;
  battery: number;
  risk: number;
  hand: string[];
  drawPile: string[];
  discard: string[];
  resolved: string[];
  /** 이번 턴에 카메라 확대를 써서 모든 카메라의 이상 유무가 보이는지 */
  revealed: boolean;
  /** 이번 밤에 쌓인 문루 빚 */
  debt: number;
  /** 이 밤에 적용 중인 보정치 (기념품 등) */
  mods: NightMods;
  outcome: NightOutcome;
  seed: number;
}

/** 기념품 등이 밤 규칙을 바꾸는 값. 모두 기본값 대비 더하기(+)다 */
export interface NightMods {
  handSize: number;
  batteryPerTurn: number;
  firstTurnBattery: number;
  firstTurnHand: number;
  maxRisk: number;
  startRisk: number;
  startRevealed: boolean;
  /** 수당 배율 보너스 (0.1 = +10%) */
  payBonus: number;
  /** 시작 덱에 섞이는 저주 카드 수 */
  curses: number;
}

export const NO_MODS: NightMods = {
  handSize: 0,
  batteryPerTurn: 0,
  firstTurnBattery: 0,
  firstTurnHand: 0,
  maxRisk: 0,
  startRisk: 0,
  startRevealed: false,
  payBonus: 0,
  curses: 0,
};

export function combineMods(list: Partial<NightMods>[]): NightMods {
  return list.reduce<NightMods>(
    (acc, m) => ({
      handSize: acc.handSize + (m.handSize ?? 0),
      batteryPerTurn: acc.batteryPerTurn + (m.batteryPerTurn ?? 0),
      firstTurnBattery: acc.firstTurnBattery + (m.firstTurnBattery ?? 0),
      firstTurnHand: acc.firstTurnHand + (m.firstTurnHand ?? 0),
      maxRisk: acc.maxRisk + (m.maxRisk ?? 0),
      startRisk: acc.startRisk + (m.startRisk ?? 0),
      startRevealed: acc.startRevealed || !!m.startRevealed,
      payBonus: acc.payBonus + (m.payBonus ?? 0),
      curses: acc.curses + (m.curses ?? 0),
    }),
    NO_MODS,
  );
}

export const NIGHT_RULES = {
  handSize: 5,
  batteryPerTurn: 3,
  maxRisk: 10,
} as const;
