import { expect, test } from '@playwright/test';
import { loadSave } from './helpers';

test('도트 프레임 애니메이션: 타이틀 문루가 시간이 지나면 다른 프레임으로 그려진다', async ({ page }) => {
  await page.goto('/');
  const shot = () => page.evaluate(() => (document.querySelector('.title-moonroo') as HTMLCanvasElement).toDataURL());
  const seen = new Set<string>();
  for (let i = 0; i < 14; i++) {
    seen.add(await shot());
    await page.waitForTimeout(250);
  }
  expect(seen.size).toBeGreaterThan(1);
});

test('동작 줄이기 설정이면 캡슐 결과와 엔딩 문장이 연출 없이 바로 나온다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await loadSave(page, { day: 3, money: 300 });
  await page.getByRole('tab', { name: '캡슐 기계' }).click();
  await page.getByRole('button', { name: /캡슐 뽑기/ }).click();
  await expect(page.locator('.pull')).toBeVisible({ timeout: 300 });

  await loadSave(page, { day: 7, phase: 'finale' });
  await page.getByRole('button', { name: /정문으로 나간다/ }).click();
  await expect(page.getByText('00:00. 정문 광장.', { exact: false }).first()).toBeVisible({ timeout: 300 });
  await expect(page.getByRole('button', { name: '건너뛰기' })).toHaveCount(0);
});

test('엔딩 문장은 타이핑되듯 나오고, 건너뛰기를 누르면 전부 보인다', async ({ page }) => {
  await loadSave(page, { day: 7, phase: 'finale' });
  await page.getByRole('button', { name: /정문으로 나간다/ }).click();
  await expect(page.locator('.typelines p').filter({ hasText: '햇살이 눈부시다' })).toHaveCount(0);
  await page.getByRole('button', { name: '건너뛰기' }).click();
  await expect(page.locator('.typelines p').filter({ hasText: '햇살이 눈부시다' })).toBeVisible();
});
