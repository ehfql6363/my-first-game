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
  cameraId: string;
  /** 이 턴부터 카메라에 나타난다 */
  appearsAtTurn: number;
  /** 수칙상 올바른 대응 */
  requires: ResponseId;
  /** 대응하지 않은 채 턴이 끝날 때마다 오르는 위험도 */
  riskPerTurn: number;
}

export interface NightDef {
  id: string;
  day: number;
  /** 10분 단위 턴. 00:00 = 0, 06:00 = 36 */
  startTurn: number;
  endTurn: number;
  cameras: CameraDef[];
  anomalies: AnomalyDef[];
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
  outcome: NightOutcome;
  seed: number;
}

export const NIGHT_RULES = {
  handSize: 5,
  batteryPerTurn: 3,
  maxRisk: 10,
} as const;
