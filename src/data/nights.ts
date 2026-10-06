import { NIGHT_1 } from './night1';
import { NIGHT_2 } from './night2';

export const NIGHTS = [NIGHT_1, NIGHT_2];
/** 지금 체험판에서 플레이할 수 있는 마지막 날 */
export const LAST_DAY = NIGHTS.length;
export const nightFor = (day: number) => NIGHTS[Math.min(day, LAST_DAY) - 1];
