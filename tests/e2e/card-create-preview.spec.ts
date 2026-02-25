import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// モックデータ
// ---------------------------------------------------------------------------
const GAME_ID = 1;

const mockGame = {
  id: GAME_ID,
  title: '新しいTCGゲーム',
  description: 'トレーディングカードゲーム',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockCard = {
  id: 1,
  gameId: GAME_ID,
  name: 'E2E_CARD',
  imageUrl: '',
  frontImageUrl: '',
  backImageUrl: '',
  width: 63,
  height: 88,
  order: 0,
  description: null,
  attributes: { type: 'monster', attack: 5, hp: 5, effect: 'E2Eテスト用カード' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ---------------------------------------------------------------------------
// テスト本体
// ---------------------------------------------------------------------------
test('カードを1枚作成し /preview で表示される', async ({ page }) => {
  let cardSaved = false;

  // --- API モック設定（page.goto より前に登録する） ---

  // POST /api/games … TCG選択時のゲーム自動作成
  // GET  /api/games … PrintPreview のゲーム一覧取得
  await page.route(/\/api\/games$/, (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(mockGame),
      });
    } else {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([mockGame]),
      });
    }
  });

  // GET /api/games/1 … Creator 内の useGame フック
  await page.route(/\/api\/games\/1$/, (route) => {
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(mockGame),
    });
  });

  // GET /api/games/1/cards … カード一覧（保存前は空、保存後は mockCard を返す）
  // POST /api/games/1/cards … カード保存
  await page.route(/\/api\/games\/1\/cards$/, (route) => {
    if (route.request().method() === 'POST') {
      cardSaved = true;
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(mockCard),
      });
    } else {
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(cardSaved ? [mockCard] : []),
      });
    }
  });

  // ① /create: TCG を選択 → TCGEditor が表示される
  await page.goto('/create');
  await page.getByTestId('card-select-tcg').click();

  // ゲーム作成後 /create/1 にリダイレクトされる
  await page.waitForURL('**/create/1');
  await page.getByTestId('button-save-card').waitFor({ state: 'visible' });

  // ② カード名を "E2E_CARD" に変更して保存
  const nameInput = page.getByTestId('input-card-name');
  await nameInput.clear();
  await nameInput.fill('E2E_CARD');

  await page.getByTestId('button-save-card').click();

  // 保存成功トーストを確認（デフォルト5sでは短い場合があるため延長）
  // Radix Toast は ARIA span と title div の2要素を生成するため exact: true で div に絞る
  await expect(page.getByText('カードを保存しました', { exact: true })).toBeVisible({ timeout: 10_000 });

  // ③ /preview: ゲームを選択し、カードが表示されることを確認
  await page.goto('/preview');
  await page.getByTestId(`button-select-game-${GAME_ID}`).click();

  await expect(page.getByTestId('print-card-E2E_CARD')).toBeVisible();
});
