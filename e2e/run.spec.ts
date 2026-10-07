import { expect, test } from '@playwright/test';
import { loadSave, playNight } from './helpers';

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

  await page.getByRole('tab', { name: '대화' }).click();
  await page.getByRole('button', { name: '다음' }).click();
  await page.getByRole('tab', { name: '덱·기념품' }).click();
  await expect(page.getByText('덱 15장')).toBeVisible();

  await page.getByRole('button', { name: /근무 시작/ }).click();
  await expect(page.locator('.strip-rules .suspect')).toHaveCount(1);
  await page.screenshot({ path: 'e2e/.results/night2.png' });
  await playNight(page);
  await expect(page.getByText('정문이 나타났다.')).toBeVisible();
  await expect(page.getByText('단서 획득 · 한태오의 이름표')).toBeVisible();
  await page.screenshot({ path: 'e2e/.results/night2-result.png' });

  await page.getByRole('button', { name: '보상 받기' }).click();
  await expect(page.getByText('어젯밤 근무 보상')).toBeVisible();
});

test('조작된 저장 데이터는 무시하고 새로 시작한다', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('happymoon-land/run', JSON.stringify({ version: 1, day: 2, deck: ['god-mode'] })));
  await page.reload();
  await expect(page.getByRole('button', { name: /이어하기/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '출근하기' })).toBeVisible();
});

test('캡슐 기계: 확률표 공개, 뽑으면 결과와 천장 카운트, 기념품 장착이 밤에 반영된다', async ({ page }) => {
  await page.goto('/');
  // 수당 1000인 2일차 낮 저장 상태에서 시작 (실제 저장 형식 그대로)
  await page.evaluate(() => {
    const deck = [...Array(4).fill('light'), ...Array(4).fill('lock'), ...Array(3).fill('ignore'), ...Array(3).fill('zoom')];
    localStorage.setItem('happymoon-land/run', JSON.stringify({ version: 3, day: 2, loop: 1, phase: 'day', deck, money: 1000, clues: [], suspected: [], rewardOptions: [], lastNight: null, seed: 5, owned: [], equipped: [], pity: 0, draws: 0, debt: 0, endings: [], lastEnding: null }));
  });
  await page.reload();
  await page.getByRole('button', { name: /이어하기/ }).click();
  await page.getByRole('tab', { name: '캡슐 기계' }).click();
  await expect(page.getByText('금색 확정까지 30회')).toBeVisible();

  await page.getByRole('button', { name: '확률 보기' }).click();
  const rates = await page.locator('.odds tbody td:last-child').allTextContents();
  expect(rates.length).toBeGreaterThan(5);
  expect(rates.reduce((s, t) => s + parseFloat(t), 0)).toBeCloseTo(100, 0);

  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: /캡슐 뽑기/ }).click();
  await expect(page.locator('.pull')).toBeVisible();
  await expect(page.getByText(/금색 확정까지 (25|30)회/)).toBeVisible();
  await page.screenshot({ path: 'e2e/.results/capsule.png' });

  await page.getByRole('tab', { name: '덱·기념품' }).click();
  const equip = page.getByRole('button', { name: '장착', exact: true }).first();
  if (await equip.count()) {
    await equip.click();
    await page.getByRole('button', { name: /근무 시작/ }).click();
    await expect(page.locator('.relic-line')).toBeVisible();
  }
});

test('실패하면 다시 1일차, 회차가 오르고 수칙서에 내 글씨 메모가 나타난다', async ({ page }) => {
  await page.goto('/?seed=3');
  await page.getByRole('button', { name: '출근하기' }).click();
  await page.getByRole('button', { name: /근무 시작/ }).click();
  for (let i = 0; i < 9 && (await page.getByRole('button', { name: /턴 종료/ }).count()); i++) await page.getByRole('button', { name: /턴 종료/ }).click();
  await expect(page.getByText('경비실 문을 두드리는 소리가 난다.')).toBeVisible();
  await page.getByRole('button', { name: '다시 출근하기' }).click();
  await expect(page.getByText('2번째 출근. 처음 출근하는 기분이다. 분명히.')).toBeVisible();
  await expect(page.getByText('여기 와 본 적 있어.', { exact: false })).toBeVisible();
  await page.screenshot({ path: 'e2e/.results/loop2.png' });
});
