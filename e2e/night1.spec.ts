import { expect, test, type Page } from '@playwright/test';

async function startNight(page: Page, seed = 7) {
  await page.goto(`/?seed=${seed}`);
  await page.getByRole('button', { name: '출근하기' }).click();
  await expect(page.getByText('야간 근무 수칙 (1일차)')).toBeVisible();
  await page.getByRole('button', { name: /근무 시작/ }).click();
  await expect(page.getByText('NIGHT 01 · 경비실')).toBeVisible();
}

const endTurn = (page: Page) => page.getByRole('button', { name: /턴 종료/ }).click();

test('타이틀 → 수칙서 → 경비실 화면이 폰 크기에서 가로로 넘치지 않고, 스크립트 오류가 없다', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await startNight(page);
  for (let i = 0; i < 3; i++) await endTurn(page);
  await page.getByRole('button', { name: /CAM 03/ }).click();
  await page.getByRole('button', { name: /소리/ }).click();
  expect(errors).toEqual([]);
  await page.getByRole('button', { name: /CAM 01/ }).click();
  await page.screenshot({ path: 'e2e/.results/night-start.png' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.getByRole('button', { name: /턴 종료/ })).toBeInViewport();
  // CCTV 그림이 실제 크기로 그려지는지 (Preact 11은 숫자 스타일에 px를 붙이지 않는다)
  const stage = await page.locator('.monitor .scene > .abs').first().boundingBox();
  expect(stage?.width).toBeGreaterThan(300);
  const arch = await page.locator('.monitor .scene .abs .abs').nth(1).boundingBox();
  expect(arch?.height).toBeGreaterThan(100);
});

test('아무 대응도 하지 않으면 실패 화면이 나온다', async ({ page }) => {
  await startNight(page);
  for (let i = 0; i < 18 && (await page.getByRole('button', { name: /턴 종료/ }).count()); i++) await endTurn(page);
  await expect(page.getByText('경비실 문을 두드리는 소리가 난다.')).toBeVisible();
  await expect(page.getByText('#7')).toBeVisible();
  await page.screenshot({ path: 'e2e/.results/night-failed.png' });
});

test('회전목마의 웃는 문루에 조명 끄기를 쓰면 대응에 성공한다', async ({ page }) => {
  await startNight(page);
  await page.getByRole('button', { name: /CAM 03/ }).click();
  let done = false;
  for (let i = 0; i < 12 && !done; i++) {
    await endTurn(page);
    const light = page.getByRole('button', { name: /조명 끄기/ }).first();
    if ((await light.count()) && ((await page.locator('.monitor').getAttribute('data-kinds')) ?? '').includes('smile')) {
      await page.screenshot({ path: 'e2e/.results/night-smile.png' });
      await light.click();
      await expect(page.getByRole('status')).toContainText('대응 성공');
      done = true;
    }
  }
  expect(done).toBe(true);
});

test('카메라 확대를 쓰면 카메라마다 이상 유무가 표시된다', async ({ page }) => {
  await startNight(page);
  let done = false;
  for (let i = 0; i < 12 && !done; i++) {
    const zoom = page.getByRole('button', { name: /카메라 확대/ }).first();
    if (await zoom.count()) {
      await zoom.click();
      await expect(page.locator('.thumb .flag')).toHaveCount(4);
      done = true;
    } else await endTurn(page);
  }
  expect(done).toBe(true);
});
