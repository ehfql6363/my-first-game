import { expect, test } from '@playwright/test';
import { loadSave, playNight } from './helpers';

test.setTimeout(240_000);

test('1일차부터 7일차까지 끝까지 플레이하고 퇴사 엔딩 → 2회차', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?seed=21');
  await page.getByRole('button', { name: '출근하기' }).click();
  await page.getByRole('button', { name: /근무 시작/ }).click();

  for (let day = 1; day <= 7; day++) {
    await playNight(page);
    await expect(page.getByText('정문이 나타났다.'), `${day}일차 생존`).toBeVisible();
    await page.screenshot({ path: `e2e/.results/story-day${day}-result.png` });
    if (day === 7) break;
    await page.getByRole('button', { name: '보상 받기' }).click();
    await page.locator('.rewards .card').first().click();
    await page.getByRole('button', { name: /가져가기/ }).click();
    await expect(page.getByText(`DAY 0${day + 1} · 숙직실`)).toBeVisible();

    if (day + 1 === 5) {
      // 특별 근무일 확정 캡슐 → 태오 피규어, 대답하지 않으면 단서
      await page.getByRole('tab', { name: '캡슐 기계' }).click();
      await page.getByRole('button', { name: /확정 캡슐/ }).click();
      await expect(page.getByText('태오 피규어')).toBeVisible();
      await page.getByRole('tab', { name: '대화' }).click();
      await page.getByRole('button', { name: /태오 피규어/ }).click();
      for (let i = 0; i < 2; i++) await page.getByRole('button', { name: '다음' }).click();
      await page.getByRole('button', { name: '대답하지 않는다' }).click();
      await expect(page.getByText('…여기서 꺼내 줘.')).toBeVisible();
      await page.screenshot({ path: 'e2e/.results/story-day5-talk.png' });
    }
    if (day + 1 === 7) await page.screenshot({ path: 'e2e/.results/story-day7-rules.png', fullPage: true });
    await page.getByRole('button', { name: /근무 시작/ }).click();
    await page.screenshot({ path: `e2e/.results/story-night${day + 1}.png` });
  }

  await page.getByRole('button', { name: '06:00' }).click();
  await page.screenshot({ path: 'e2e/.results/story-finale.png' });
  await expect(page.getByRole('button', { name: /████████을 부른다/ })).toBeDisabled();
  await page.getByRole('button', { name: /정문으로 나간다/ }).click();
  await expect(page.getByText('NORMAL END')).toBeVisible();
  await page.screenshot({ path: 'e2e/.results/story-ending-resign.png' });
  await page.getByRole('button', { name: '다시 출근하기' }).click();
  await expect(page.getByText('2번째 출근. 처음 출근하는 기분이다. 분명히.')).toBeVisible();
  expect(errors).toEqual([]);
});

test('이름을 알고 동료를 모두 구출했다면 폐장 엔딩을 고를 수 있다', async ({ page }) => {
  await loadSave(page, {
    day: 7,
    phase: 'finale',
    clues: ['own-name'],
    owned: ['banjang', 'haru', 'doyun', 'oksun', 'sora', 'yuna', 'taeo-figure', 'dalhee-0'],
  });
  await page.getByRole('button', { name: /내 이름은 윤달희야/ }).click();
  await expect(page.getByText('TRUE END')).toBeVisible();
  await expect(page.getByText('폐장')).toBeVisible();
  await page.screenshot({ path: 'e2e/.results/story-ending-closing.png', fullPage: true });
});

test('검은 캡슐: 이름을 알고 캡슐 동료 6명 이상과 태오 피규어를 구출하면 0회차의 나가 나온다', async ({ page }) => {
  await loadSave(page, { day: 7, clues: ['own-name'], owned: ['banjang', 'haru', 'doyun', 'oksun', 'sora', 'taeo-figure'] });
  await page.getByRole('tab', { name: '캡슐 기계' }).click();
  await expect(page.getByRole('button', { name: '검은 캡슐이 굴러 나왔다' })).toHaveCount(0);
  await loadSave(page, { day: 7, clues: ['own-name'], owned: ['banjang', 'haru', 'doyun', 'oksun', 'sora', 'yuna', 'taeo-figure'] });
  await page.getByRole('tab', { name: '캡슐 기계' }).click();
  await page.getByRole('button', { name: '검은 캡슐이 굴러 나왔다' }).click();
  await expect(page.getByText('안녕. 너는 몇 번째 나야?', { exact: false })).toBeVisible();
});

test('폐장 조건이 모자라면 무엇이 모자란지 보여 준다', async ({ page }) => {
  await loadSave(page, { day: 7, phase: 'finale', clues: ['own-name'], owned: ['banjang', 'haru', 'taeo-figure'] });
  await expect(page.getByRole('button', { name: /구출할 캡슐 동료 4명 더/ })).toBeDisabled();
});

test('서민지는 퇴사 엔딩을 본 뒤에야 캡슐 기계 확률표에 나타난다', async ({ page }) => {
  await loadSave(page, { day: 3 });
  await page.getByRole('tab', { name: '캡슐 기계' }).click();
  await page.getByRole('button', { name: '확률 보기' }).click();
  await expect(page.locator('.odds')).not.toContainText('서민지');
  await loadSave(page, { day: 3, endings: ['resign'] });
  await page.getByRole('tab', { name: '캡슐 기계' }).click();
  await page.getByRole('button', { name: '확률 보기' }).click();
  await expect(page.locator('.odds')).toContainText('서민지');
});
