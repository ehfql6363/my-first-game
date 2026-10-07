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
  /** 이 엔딩을 본 뒤에야 캡슐 기계에 나타난다 */
  unlockEnding?: 'resign' | 'regular' | 'closing';
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
  // 숙직실 대화의 민지(SPEAKERS 'minji')와 다른 존재: 지난 회차에 남겨진 민지
  'minji-past': {
    id: 'minji-past', name: '서민지', grade: 'gold', card: 'rule-reading', color: '#ffb877', tag: '지난 회차에 남은 동기', unlockEnding: 'resign',
    capsuleLine: '또 왔네? …이번엔 같이 나가는 거지? 그렇지? 그렇지?',
    lines: ['수칙은 다 외웠어. 여기 있는 동안 할 게 그것밖에 없었거든.', '너 나갈 때 손 흔들었잖아. 나 그거 매일 연습해. 다음엔 같이 흔들려고.', '…탈 속은 생각보다 조용해. 다들 웃고 있어서.'],
  },
  oksun: {
    id: 'oksun', name: '이옥순', grade: 'purple', card: 'salt', color: '#c9c2e8', tag: '10년 전 야간 청소부',
    capsuleLine: '쓸어도 쓸어도 웃음소리가 쌓여. 너도 좀 쓸어 봐.',
    lines: ['문마다 소금을 뿌렸지. 마지막 날 밤엔 소금이 다 떨어졌어.', '웃음소리는 쓸면 없어져. 잠깐은.', '문루한테 뭘 받았으면 말해. 소금으로 갚는 법도 있어.'],
  },
  haeun: {
    id: 'haeun', name: '지하은', grade: 'purple', card: 'night-shot', color: '#ff6fae', tag: '공포 유튜버',
    capsuleLine: '구독, 좋아요, 알림 설정… 아무도 안 눌렀어. 너 저번에도 내 영상에 나왔었는데.',
    lines: ['마지막 영상 조회수 0. 근데 댓글이 하나 달렸어. "또 왔네?"', '카메라는 거짓말 안 해. 사람이 거짓말하지.', '내 영상에 네가 나와. 매번 같은 옷, 같은 표정으로.'],
  },
  sora: {
    id: 'sora', name: '임소라', grade: 'blue', card: 'first-aid', color: '#6ff2c8', tag: '간호학과 학생',
    capsuleLine: '다치면 말해요. 여기선 아무도 안 죽어요. …그게 문제지만.',
    lines: ['등록금 벌러 왔어요. 이번 학기 등록은… 몇 년 전에 끝났겠죠.', '위험도는 숨처럼 쉬어 줘야 돼요. 들이쉬고, 내쉬고.', '아픈 데 없어요? 여기선 아파도 티가 안 나요.'],
  },
  boknam: {
    id: 'boknam', name: '문복남', grade: 'blue', card: 'vanish-trick', color: '#4f8dff', tag: '은퇴 마술사',
    capsuleLine: '사라지는 마술은 자신 있었는데. 돌아오는 건 못 배웠지.',
    lines: ['개장 공연 때 저 무대에 섰지. 박수 소리는 아직도 들려. 손이 네 개짜리 박수.', '카드는 보는 데서 뽑는 게 아니야. 안 보는 데서 뽑는 거지.', '자, 아무 카드나 골라 봐. …봐, 또 웃음소리잖아.'],
  },
  yuna: {
    id: 'yuna', name: '최유나', grade: 'white', card: 'lightstick', color: '#ffd76a', tag: '아이돌 연습생',
    capsuleLine: '웃어야 데뷔한대요. 저 지금 잘 웃고 있어요?',
    lines: ['퍼레이드 무대에 서면 데뷔시켜 준대요. 방송에서 그랬어요.', '응원봉 불빛은 꺼지지 않아요. 배터리가 없어도.', '언니도 웃어 봐요. 여기선 웃는 사람만 남거든요.'],
  },
  gangcheol: {
    id: 'gangcheol', name: '배강철', grade: 'white', card: 'bare-fist', color: '#efe6cf', tag: '헬스 트레이너',
    capsuleLine: '괴물도 결국 근육이야. …근데 쟤들은 왜 때려도 말랑해?',
    lines: ['문은 잠그는 게 아니라 버티는 거야. 어깨로.', '하체를 해야 도망도 가지. 근데 여기선 도망갈 데가 없더라.', '단백질 남은 거 있어? 여기 매점은 솜사탕밖에 안 팔아.'],
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

/** 모든 동료 (구출 현황 표시용) */
export const ALL_COMPANION_IDS = [...Object.keys(COMPANIONS), ...Object.keys(STORY_COMPANIONS)];
