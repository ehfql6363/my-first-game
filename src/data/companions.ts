import type { Grade } from '../core/gacha';

/** 캡슐 기계에서 구출하는 동료. 구출하면 전용 카드가 덱에 들어가고 숙직실에서 대화할 수 있다 (docs/story/companions.md) */
export interface CompanionDef {
  id: string;
  name: string;
  grade: Grade;
  card: string;
  color: string;
  tag: string;
  /** 캡슐에서 나올 때 첫 대사 */
  capsuleLine: string;
  lines: string[];
  /** 숙직실 대화 마지막에 고르는 선택지 (고른 답에 따라 단서) */
  choice?: { prompt: string; options: { label: string; reply: string; clue?: string }[] };
}

export const COMPANIONS: Record<string, CompanionDef> = {
  banjang: {
    id: 'banjang', name: '김반장', grade: 'gold', card: 'patrol', color: '#ffd76a', tag: '10년 전 경비반장',
    capsuleLine: '…신입. 이번엔 퍼레이드 쪽으로 가지 마라. 내가 대신 간다.',
    lines: ['…신입. 잠은 잤나.', '여기선 자도 피곤이 안 풀린다. 원래 그래. 십 년째.', '회전목마 카메라는 오래 보지 마라. 저쪽도 너를 본다.'],
  },
  haru: {
    id: 'haru', name: '하루', grade: 'purple', card: 'mascot-act', color: '#a46bff', tag: '10년 전 문루 탈 알바',
    capsuleLine: '안녕하세요! 해피문 랜드에 오신 걸 환영… 아, 죄송해요. 제 얼굴 어디 있는지 보셨어요?',
    lines: ['탈 속은 따뜻해요. 숨만 좀 막히고요.', '웃는 문루한테는 조명을 꺼 주세요. 걔네도 자고 싶거든요.', '저 원래 얼굴이 어땠는지 기억나세요? …아, 처음 보시는구나.'],
  },
  doyun: {
    id: 'doyun', name: '박도윤', grade: 'blue', card: 'wrench', color: '#4f8dff', tag: '10년 전 회전목마 정비공',
    capsuleLine: '말은 열두 마리야. 열세 번째 말엔 절대 타지 마. 나처럼.',
    lines: ['보고서를 올렸지. 말이 한 마리 늘었다고. 파쇄기 소리가 아직 들려.', '렌치는 아무 문에나 맞아. 여기 문들은 다 같은 데로 통하거든.', '너, 정문 본 적 있어? 06:00에 나타나는 거 말고. 진짜 정문.'],
  },
};

/**
 * 스토리로 얻는 동료. 캡슐 기계의 무작위 풀에는 들어가지 않는다 (CLAUDE.md 규칙).
 * - 태오 피규어: 5일차 낮, 특별 근무일 확정 캡슐
 * - 0회차의 나: 자기 이름을 알고(own-name) 캡슐 동료를 모두 구출하면 검은 캡슐
 */
export const STORY_COMPANIONS: Record<string, CompanionDef & { unlockDay?: number }> = {
  'taeo-figure': {
    id: 'taeo-figure', name: '태오 피규어', grade: 'purple', card: 'excuse', color: '#a46bff', tag: '캡슐에서 나온 동기', unlockDay: 5,
    capsuleLine: '가-ㅁ사합니다! 저를 뽑아 주셔서! 저는 행복합니다! 저는 행복합니다!',
    lines: ['가-ㅁ사합니다! 저를 뽑아 주셔서!', '여기 따뜻해요. 좁고, 따뜻해요.', '저는 행복합니다! …저는 행복합니까?'],
    choice: {
      prompt: '태오 피규어가 묻는다. "저 행복해 보여요?"',
      options: [
        { label: '대답한다: "응, 행복해 보여."', reply: '"저는 행복합니다! 저는 행복합니다! 저는 행복합니다!"' },
        { label: '대답하지 않는다', reply: '웃음이 멈췄다. 아주 작은 목소리. "…여기서 꺼내 줘."', clue: 'taeo-plea' },
      ],
    },
  },
  'dalhee-0': {
    id: 'dalhee-0', name: '0회차의 나', grade: 'gold', card: 'blank-tag', color: '#0b0b12', tag: '10년 전 첫 출근날',
    capsuleLine: '안녕. 너는 몇 번째 나야?',
    lines: ['10년 동안 유리 너머로 봤어. 매일 처음 출근하는 나를.', '이름은 불러 주는 게 아니야. 부르는 거야.', '마지막 날, 대답하지 마. 네가 불러.'],
  },
};

/** 폐장 엔딩에 필요한 동료: 캡슐 동료 전원 + 스토리 동료 전원 */
export const ALL_COMPANION_IDS = [...Object.keys(COMPANIONS), ...Object.keys(STORY_COMPANIONS)];
