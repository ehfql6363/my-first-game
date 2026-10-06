import { expect, type Page } from '@playwright/test';

/** 수칙대로(거짓 수칙은 간파해서) 대응할 카드 */
const RESPONSE: Record<string, string> = {
  smile: '조명 끄기',
  reverse: '조명 끄기',
  balloon: '문 잠그기',
  horse13: '문 잠그기',
  taeo: '문 잠그기',
  namecall: '방송 무시',
};

/** 카메라를 하나씩 넘겨 보며 보이는 이상 현상에 대응하고 턴을 넘긴다 */
export async function playTurn(page: Page) {
  const thumbs = page.locator('.thumb');
  for (let i = 0; i < (await thumbs.count()); i++) {
    await thumbs.nth(i).click();
    const kinds = ((await page.locator('.monitor').getAttribute('data-kinds')) ?? '').split(' ').filter(Boolean);
    for (const k of kinds) {
      const card = page.locator('.hand .card:not([disabled])', { hasText: RESPONSE[k] }).first();
      if (await card.count()) await card.click();
    }
  }
  await page.getByRole('button', { name: /턴 종료/ }).click();
}

export async function playNight(page: Page) {
  for (let i = 0; i < 12 && (await page.getByRole('button', { name: /턴 종료/ }).count()); i++) await playTurn(page);
  await expect(page.locator('.result')).toBeVisible();
}
