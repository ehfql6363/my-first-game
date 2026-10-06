import type { NightDef } from '../core/types';

// 1일차 · 정문 광장. 수칙은 전부 진실 (docs/story/rulebooks.md)
export const NIGHT_1: NightDef = {
  id: 'night-1',
  day: 1,
  startTurn: 0,
  endTurn: 36,
  cameras: [
    { id: 'gate', name: '정문 광장' },
    { id: 'ticket', name: '매표소' },
    { id: 'carousel', name: '회전목마' },
    { id: 'broadcast', name: '방송실' },
  ],
  anomalies: [
    { id: 'smiling-moonroo', name: '웃는 문루', cameraId: 'carousel', appearsAtTurn: 4, requires: 'light', riskPerTurn: 1 },
    { id: 'name-call', name: '이름을 부르는 방송', cameraId: 'broadcast', appearsAtTurn: 10, requires: 'ignore', riskPerTurn: 2 },
    { id: 'open-booth', name: '열린 매표소 문', cameraId: 'ticket', appearsAtTurn: 18, requires: 'lock', riskPerTurn: 1 },
  ],
};
