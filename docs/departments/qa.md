# QA 부서

- 매 마일스톤 끝에:
  1. `npm run check` 통과
  2. `npm run build` 후 실제 브라우저(Playwright + Chromium)로 한 판 끝까지 플레이, 스크린샷
  3. 폰 크기(390×844)에서 화면이 잘리지 않는지
  4. 수칙서의 진실/거짓과 실제 게임 판정이 일치하는지 (`rulebooks.md` 설계 메모와 대조)
- 버그는 `docs/dev/progress.md`의 다음 할 일에 재현 방법과 함께 적는다.
- "가끔 된다"는 버그로 본다. 시드를 기록해서 재현한다.
