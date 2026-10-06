# 개발 부서

- 기준 문서: `CLAUDE.md`, `docs/dev/plan.md`
- 규칙은 `src/core`에 순수 함수로, 테스트와 함께. 화면은 `src/ui`, 데이터는 `src/data`.
- 커밋 전 `npm run check`. 실패한 채로 커밋하지 않는다.
- 한 커밋에 한 가지 일. 메시지는 한국어로 무엇을 왜.
- 새 라이브러리를 추가할 때는 이유를 `docs/dev/plan.md`에 적는다.
