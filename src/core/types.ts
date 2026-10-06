// 게임 규칙에 쓰이는 타입. DOM이나 화면 코드는 여기 들어오지 않는다.

export type ResponseId = 'light' | 'lock' | 'ignore' | 'zoom';
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
  /** 수칙상 올바른 대응 */
  requires: ResponseId;
  /** 대응하지 않은 채 턴이 끝날 때마다 오르는 위험도 */
  riskPerTurn: number;
}

export interface RuleText {
  no: number;
  text: string;
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
  outcome: NightOutcome;
  seed: number;
}

export const NIGHT_RULES = {
  handSize: 5,
  batteryPerTurn: 3,
  maxRisk: 10,
} as const;
