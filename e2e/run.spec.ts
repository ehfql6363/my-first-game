import { expect, test } from '@playwright/test';
import { playNight } from './helpers';

test('1일차 → 보상 → 숙직실 → 2일차(거짓 수칙 간파) → 체험판 끝, 중간 저장과 이어하기', async ({ page }) => {
  await page.goto('/?seed=11');
  await page.getByRole('button', { name: '출근하기' }).click();
  await page.getByRole('button', { name: /근무 시작/ }).click();
  await playNight(page);
  await expect(page.getByText('정문이 나타났다.')).toBeVisible();

  await page.getByRole('button', { name: '보상 받기' }).click();
  await page.locator('.rewards .card').first().click();
  await page.getByRole('button', { name: /가져가기/ }).click();

  await expect(page.getByText('DAY 02 · 숙직실')).toBeVisible();
  await page.getByRole('button', { name: '7번 수칙 의심 표시' }).click();
  await expect(page.getByRole('button', { name: /근무 시작/ })).toBeInViewport();
  await page.screenshot({ path: 'e2e/.results/day2.png' });

  // 새로고침해도 낮 상태와 의심 표시가 남아 있다
  await page.reload();
  await page.getByRole('button', { name: /이어하기 · 2일차 낮/ }).click();
  await expect(page.getByRole('button', { name: '7번 수칙 의심 표시' })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('tab', { name: '동료와 대화' }).click();
  await page.getByRole('button', { name: '다음' }).click();
  await page.getByRole('tab', { name: '덱·단서' }).click();
  await expect(page.getByText('덱 15장')).toBeVisible();

  await page.getByRole('button', { name: /근무 시작/ }).click();
  await expect(page.locator('.strip-rules .suspect')).toHaveCount(1);
  await page.screenshot({ path: 'e2e/.results/night2.png' });
  await playNight(page);
  await expect(page.getByText('정문이 나타났다.')).toBeVisible();
  await expect(page.getByText('단서 획득 · 한태오의 이름표')).toBeVisible();
  await page.screenshot({ path: 'e2e/.results/night2-result.png' });

  await page.getByRole('button', { name: '계속' }).click();
  await expect(page.getByText('2일차 근무 완료')).toBeVisible();
});

test('조작된 저장 데이터는 무시하고 새로 시작한다', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('happymoon-land/run', JSON.stringify({ version: 1, day: 2, deck: ['god-mode'] })));
  await page.reload();
  await expect(page.getByRole('button', { name: /이어하기/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '출근하기' })).toBeVisible();
});
