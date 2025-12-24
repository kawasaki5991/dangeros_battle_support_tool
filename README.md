
# 戦闘破壊学園ダンゲロス オンライン対戦支援ツール

## 🚀 GitHub Actions による自動公開設定（推奨）

ソースコードをアップロードするだけで、GitHubが自動的にビルドして公開する設定手順です。

### 手順 1：GitHub上での設定
1.  GitHubのレポジトリ画面で **「Settings」** タブをクリック。
2.  左メニューの **「Pages」** をクリック。
3.  **Build and deployment > Source** のプルダウンを `Deploy from a branch` から **`GitHub Actions`** に変更します。
    - ※ これだけで、`.github/workflows/deploy.yml` が自動的に認識されます。

### 手順 2：更新の反映
1.  ソースコード（`.tsx`ファイルなど）を変更し、GitHubの `main` ブランチに `push` します。
2.  レポジトリ画面の **「Actions」** タブを見ると、ビルドが動いているのが確認できます。
3.  数分後、緑色のチェックマークがついたら公開完了です！

## ⚠️ 注意事項
- **URLについて**: 公開URLは `https://<ユーザー名>.github.io/dangeros_battle_support_tool/` になります。
- **404エラーが出る場合**: URLの末尾に必ず `/` を含めてください。
- **ローカルでの確認**: `npm run dev` でローカルプレビューが可能です。
