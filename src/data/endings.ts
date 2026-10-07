import type { ClosingRequirement, EndingId } from '../core/run';
import { COMPANIONS } from './companions';

/**
 * 폐장 엔딩 조건: 자기 이름(own-name 단서) + 태오 피규어 + 0회차의 나 + 캡슐 동료 10명 중 6명 이상.
 * (캡슐 동료 전원은 회차가 너무 많이 걸려서 6명으로. 바꾸려면 count만 고치면 된다)
 */
export const CLOSING_REQUIREMENT: ClosingRequirement = {
  clue: 'own-name',
  owned: ['taeo-figure', 'dalhee-0'],
  atLeast: { pool: Object.keys(COMPANIONS), count: 6 },
};
/** 검은 캡슐(0회차의 나)이 나오는 조건: 폐장 조건에서 0회차의 나만 뺀 것 */
export const BLACK_CAPSULE_REQUIREMENT: ClosingRequirement = { ...CLOSING_REQUIREMENT, owned: ['taeo-figure'] };

export interface EndingDef {
  id: EndingId;
  title: string;
  kind: string;
  choice: string;
  lines: string[];
}

export const ENDING_DEFS: Record<EndingId, EndingDef> = {
  regular: {
    id: 'regular',
    title: '정규직',
    kind: 'BAD END',
    choice: '대답한다. "네."',
    lines: [
      '대답했다. "네."',
      '방송이 다정하게 웃었다. "축하합니다, 윤달희 님! 오늘부터 당신은 해피문 랜드의 가족입니다."',
      '탈은 따뜻했다. 숨만 조금 막혔다.',
      '다음 날 밤, 새 수습생에게 수칙서를 건넸다. 웃는 얼굴로.',
    ],
  },
  resign: {
    id: 'resign',
    title: '퇴사',
    kind: 'NORMAL END',
    choice: '대답하지 않고 정문으로 나간다',
    lines: [
      '06:00. 정문이 나타났다. 문을 밀고 나갔다.',
      '햇살이 눈부시다. 뒤를 돌아보니 민지가 문루 탈을 쓰고 손을 흔들고 있었다.',
      '…화면이 하얘진다.',
      '00:00. 정문 광장. 수칙서 한 장. "수습 경비원 여러분, 해피문 랜드에 오신 것을 환영합니다!"',
    ],
  },
  closing: {
    id: 'closing',
    title: '폐장',
    kind: 'TRUE END',
    choice: '대답하지 않는다. 내가 부른다. "내 이름은 윤달희야."',
    lines: [
      '방송이 이름을 불렀다. 대답하지 않았다. 대신 내가 불렀다. "내 이름은 윤달희야."',
      '퍼레이드가 멈췄다. 캡슐 기계의 불이 꺼지고, 작은 손들이 유리를 밀고 나왔다.',
      '문루 탈 하나가 벗겨졌다. 처음 보는 얼굴이 웃었다. J였다.',
      '민지의 손을 잡고 정문을 나섰다. 06:01. 공원의 불이 하나씩 꺼진다.',
    ],
  },
};
