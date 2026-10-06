/** 숙직실 대화. 날짜별로 다르다. 스포일러(플레이어 정체)는 넣지 않는다 */
export interface Speaker {
  id: string;
  name: string;
  tag: string;
  color: string;
  lines: Record<number, string[]>;
}

export const SPEAKERS: Speaker[] = [
  {
    id: 'minji',
    name: '서민지',
    tag: '수습 동기',
    color: '#ffb877',
    lines: {
      2: [
        '어제 진짜 무서웠다… 근데 수칙만 지키면 되잖아. 그치?',
        '근데 이상하지 않아? 나 너 어디서 본 것 같아. 아주 많이.',
        '…아니다. 내가 피곤한가 봐. 여긴 낮인데도 잠이 안 와.',
      ],
    },
  },
  {
    id: 'taeo',
    name: '한태오',
    tag: '수습 동기',
    color: '#a46bff',
    lines: {
      2: [
        '이번 주만 버티면 첫 월급이에요! 엄마 패딩 사 드리려고요.',
        '근데 월급날 들으셨어요? 계약서에 날짜 칸이 비어 있던데.',
        '에이, 뭐 어때요. 힘들면 먼저 퇴근하면 되죠 ㅎㅎ',
      ],
    },
  },
];
