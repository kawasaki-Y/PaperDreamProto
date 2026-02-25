import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// モックデータ
// ---------------------------------------------------------------------------
const GAME_ID = 1;
const PCG_GAME_ID = 2;

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

test('PCGカードを1枚作成し /preview で表示される', async ({ page }) => {
  let cardSaved = false;

  const mockPcgGame = {
    id: PCG_GAME_ID,
    title: 'サンプル',
    description: '[PCG] パーティカードゲーム',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockPcgCard = {
    id: 10,
    gameId: PCG_GAME_ID,
    name: 'E2E_PCG',
    imageUrl: '',
    frontImageUrl: '',
    backImageUrl: '',
    width: 63,
    height: 88,
    order: 0,
    description: null,
    attributes: { type: 'action', playerCount: '2-4', difficulty: 'medium', winCondition: '', action: '', effect: '' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await page.route(/\/api\/games$/, (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(mockPcgGame) });
    } else {
      route.fulfill({ contentType: 'application/json', body: JSON.stringify([mockPcgGame]) });
    }
  });

  await page.route(/\/api\/games\/2$/, (route) => {
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(mockPcgGame) });
  });

  await page.route(/\/api\/games\/2\/cards$/, (route) => {
    if (route.request().method() === 'POST') {
      cardSaved = true;
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(mockPcgCard) });
    } else {
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(cardSaved ? [mockPcgCard] : []) });
    }
  });

  // ① /create: PCG を選択 → ゲーム作成フォームが表示される
  await page.goto('/create');
  await page.getByTestId('card-select-pcg').click();

  // ゲーム名を入力して作成
  await page.getByTestId('input-pcg-game-title').fill('E2Eテストゲーム');
  await page.getByTestId('button-pcg-create-submit').click();

  await page.waitForURL('**/create/2');

  // PCGCardManager から新規カード追加ボタンをクリックして PCGCardEditor を開く
  await page.getByTestId('button-add-new-card').click();
  await page.getByTestId('button-save-card').waitFor({ state: 'visible' });

  // ② カード名を "E2E_PCG" に入力して保存
  await page.getByTestId('input-pcg-card-name').fill('E2E_PCG');
  await page.getByTestId('button-save-card').click();

  await expect(page.getByText('カードを保存しました', { exact: true })).toBeVisible({ timeout: 10_000 });

  // ③ /preview: ゲームを選択し、カードが表示されることを確認
  await page.goto('/preview');
  await page.getByTestId(`button-select-game-${PCG_GAME_ID}`).click();

  await expect(page.getByTestId('print-card-E2E_PCG')).toBeVisible();
});
