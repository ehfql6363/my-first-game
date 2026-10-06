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
