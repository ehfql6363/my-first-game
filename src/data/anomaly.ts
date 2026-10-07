import type { AnomalyDef } from '../core/types';

/** 밤 데이터 작성 도우미: id 앞에 밤 접두어를 붙인다 */
export const anomalyMaker =
  (prefix: string) =>
  (
    id: string,
    kind: string,
    cameraId: string,
    appearsAtTurn: number,
    requires: AnomalyDef['requires'],
    riskPerTurn: number,
    name: string,
    extra: Partial<AnomalyDef> = {},
  ): AnomalyDef => ({ id: `${prefix}-${id}`, kind, cameraId, appearsAtTurn, requires, riskPerTurn, name, ...extra });
