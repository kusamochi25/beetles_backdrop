# 昆虫図鑑ベータ

JSON データをもとにビルド時にページを生成し、完全静的サイトとして公開するための最小構成です。

## 進め方

1. `data/species/*.json` と `data/gallery/*.json` を編集します
2. `npm run generate` で `generated-pages/` に HTML、検索インデックス、ダミー画像を生成します
3. `npm run build` で `dist/` に公開用成果物を出力します

## 現在の責務分離

### 手管理ファイル
- `data/`
- `src/`
- `scripts/`
- `public/` 配下の favicon 類
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `README.md`

### 生成物
- `generated-pages/`
  - `index.html`
  - `search/index.html`
  - `gallery/index.html`
  - `groups/**/index.html`
  - `genus/**/index.html`
  - `species/**/index.html`
  - `search-index.json`
  - `images/**`

### 成果物
- `dist/`

### 依存物
- `node_modules/`

## ディレクトリ構成

```text
data/
  species/*.json
  gallery/*.json
public/
  apple-touch-icon.png
  favicon.ico
  favicon.svg
  robots.txt
src/
  main.ts
  App.vue
  styles.css
  types.ts
  components/
    LightboxModal.vue
    SiteHeader.vue
    SpeciesCard.vue
scripts/
  generate-site.mjs
generated-pages/
  index.html
  search/index.html
  gallery/index.html
  groups/**
  genus/**
  species/**
  search-index.json
  images/**
dist/
package.json
package-lock.json
tsconfig.json
vite.config.ts
README.md
.gitignore
```

## 各ページの役割

- `/`
  図鑑の入口です。分類、注目種、写真集の導線をまとめます。
- `/search/`
  `search-index.json` をフロントで読み込み、学名、和名、属名、aliases を検索します。
- `/groups/{group}/`
  グループ別の種一覧です。まず 20 件表示し、件数が増えても段階表示へ広げやすい構成です。
- `/genus/{slug}/`
  属ごとの種一覧です。属内ソートの基準として使います。
- `/species/{slug}/`
  種詳細ページです。画像拡大、関連種、属内の前後リンクを持ちます。
- `/gallery/`
  種データとは分離した写真集ページです。

## 今回実装したこと

- Vue 3 + Vite の静的マルチページ構成
- 5 件のサンプル種 JSON と 3 件のギャラリー JSON
- 検索用 `search-index.json` の自動生成
- トップ、一覧、属、種詳細、検索、ギャラリーの最小 UI
- 種詳細とギャラリーで使える画像拡大表示
- 公開用画像パスを `thumb` / `medium` / `large` に分離
- 一覧の初期 20 件表示
- `loading="lazy"` による画像遅延読み込み
- `generated-pages/` への生成物集約

## 1000 種へ拡張するときの注意点

- `search-index.json` は軽量な項目だけに限定し、説明文や大型画像は含めない
- 将来的にはグループ単位や頭文字単位で検索インデックスを分割する
- 種 JSON は 1 種 1 ファイルを維持し、ビルド時に一覧や索引だけを集約生成する
- 前後リンクや属ページの並び順はビルド時に計算し、実行時ロジックを増やさない
- ダミー画像をやめて実画像へ切り替える場合も、URL ルールは維持する

## Cloudflare Pages 向けの注意点

- デプロイ対象は `dist/` を指定します
- Build command は `npm run build` を使います
- 各 URL に対して `index.html` が生成される構成です
- サーバーサイド実行は不要です
- ルート公開前提のため、`base` は `/` にしています
