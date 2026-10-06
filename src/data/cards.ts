import type { CardDef } from '../core/types';

export const CARDS: Record<string, CardDef> = {
  light: { id: 'light', name: '조명 끄기', cost: 1, kind: 'basic', response: 'light', desc: '이 구역 조명을 끈다' },
  lock: { id: 'lock', name: '문 잠그기', cost: 1, kind: 'basic', response: 'lock', desc: '이 구역 문을 잠근다' },
  ignore: { id: 'ignore', name: '방송 무시', cost: 0, kind: 'basic', response: 'ignore', desc: '들리지 않는 척한다' },
  zoom: { id: 'zoom', name: '카메라 확대', cost: 1, kind: 'basic', response: 'zoom', desc: '숨은 이상 현상 확인' },
  laughter: { id: 'laughter', name: '웃음소리', cost: null, kind: 'curse', desc: '쓸 수 없다. 자리만 차지한다' },
};

export const STARTER_DECK: string[] = [
  ...Array(4).fill('light'),
  ...Array(4).fill('lock'),
  ...Array(3).fill('ignore'),
  ...Array(3).fill('zoom'),
];
