import { NIGHT_1 } from './night1';
import { NIGHT_2 } from './night2';
import { NIGHT_3 } from './night3';
import { NIGHT_4 } from './night4';
import { NIGHT_5 } from './night5';
import { NIGHT_6 } from './night6';
import { NIGHT_7 } from './night7';

export const NIGHTS = [NIGHT_1, NIGHT_2, NIGHT_3, NIGHT_4, NIGHT_5, NIGHT_6, NIGHT_7];
/** 마지막 날. 이 밤을 버티면 엔딩을 고른다 */
export const LAST_DAY = NIGHTS.length;
export const nightFor = (day: number) => NIGHTS[Math.min(day, LAST_DAY) - 1];
