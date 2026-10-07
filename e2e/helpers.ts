import { expect, type Page } from '@playwright/test';

/** 이상 현상별로 낼 카드 (거짓 수칙은 간파한 쪽으로) */
const RESPONSE: Record<string, string> = {
  smile: '조명 끄기',
  reverse: '조명 끄기',
  star: '조명 끄기',
  parade: '조명 끄기',
  balloon: '문 잠그기',
  horse13: '문 잠그기',
  taeo: '문 잠그기',
  exit2: '문 잠그기',
  staffdoor: '문 잠그기',
  offer: '문 잠그기',
  wheelfast: '문 잠그기',
  whisper: '문 잠그기',
  namecall: '방송 무시',
  ghost: '방송 무시',
  topcar: '카메라 확대',
  wallnames: '카메라 확대',
  tunneldoor: '카메라 확대',
};
/** "보지 마십시오": 대응하지 않고, 이 화면을 보며 턴을 끝내지 않는다 */
const GAZE = new Set(['mirror', 'passenger', 'knownface', 'guardface']);

/** 카메라를 하나씩 넘겨 보며 보이는 이상 현상에 대응하고, 보면 안 되는 화면을 피해 턴을 넘긴다 */
export async function playTurn(page: Page) {
  const thumbs = page.locator('.thumb');
  const count = await thumbs.count();
  const unsafe = new Set<number>();
  for (let i = 0; i < count; i++) {
    await thumbs.nth(i).click();
    const kinds = ((await page.locator('.monitor').getAttribute('data-kinds')) ?? '').split(' ').filter(Boolean);
    for (const k of kinds) {
      if (GAZE.has(k)) {
        unsafe.add(i);
        continue;
      }
      let card = page.locator('.hand .card:not([disabled])', { hasText: RESPONSE[k] }).first();
      // 맞는 카드가 없으면 만능 카드(호루라기)라도
      if (!(await card.count())) card = page.locator('.hand .card:not([disabled])', { hasText: '호루라기' }).first();
      if (await card.count()) await card.click();
    }
  }
  const safe = [...Array(count).keys()].find((i) => !unsafe.has(i)) ?? 0;
  await thumbs.nth(safe).click();
  await page.getByRole('button', { name: /턴 종료/ }).click();
}

export async function playNight(page: Page) {
  for (let i = 0; i < 12 && (await page.getByRole('button', { name: /턴 종료/ }).count()); i++) await playTurn(page);
  await expect(page.locator('.result')).toBeVisible();
}

/** 실제 저장 형식(버전 3) 그대로 저장해 두고 이어하기 */
export async function loadSave(page: Page, patch: Record<string, unknown>) {
  await page.goto('/');
  await page.evaluate((p) => {
    const deck = [...Array(4).fill('light'), ...Array(4).fill('lock'), ...Array(3).fill('ignore'), ...Array(3).fill('zoom')];
    const base = { version: 3, day: 1, loop: 1, phase: 'day', deck, money: 0, clues: [], suspected: [], rewardOptions: [], lastNight: null, seed: 5, owned: [], equipped: [], pity: 0, draws: 0, debt: 0, endings: [], lastEnding: null };
    localStorage.setItem('happymoon-land/run', JSON.stringify({ ...base, ...p }));
  }, patch);
  await page.reload();
  await page.getByRole('button', { name: /이어하기/ }).click();
}
