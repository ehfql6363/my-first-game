/** 기기의 "동작 줄이기" 설정. 켜져 있으면 연출을 건너뛰고 결과만 보여 준다 */
export function reducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
