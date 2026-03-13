# AlimaWordGenerator (Online Version)

Alima語（変な略語）を自動生成するWebアプリケーションです。
このバージョンでは、裏側で **Cloudflare Workers** と **Gemini API** を連携させることで、AIによる「本人さながらの絶妙な略し方（最後を濁音にするなど）」を実現しています。

## 🎮 遊び方

1. サイトのURLにアクセスします。
2. 入力欄に好きな言葉（例：「セブンイレブン」「スターバックス」など）を入力します。
3. 「略す！」ボタンを押すと、Alimaアイコンが考え始め、数秒後に絶妙に省略された謎のカタカナ語が生成されます。
4. 結果をTwitter（𝕏）でシェアしたり、コピーして友人に共有したりして楽しんでください！

---

## 🛠️ 開発者向けセットアップ手順

このツールはフロントエンド（GitHub Pages等で公開するHTML/CSS/JS）と、バックエンド（Cloudflare Workers上で動かすAPI）の2層構造になっています。

### バックエンド（Cloudflare Worker）のデプロイ
Gemini APIをブラウザ側から直接叩くとAPIキーが漏洩してしまうため、Cloudflare Workerを経由して安全に通信します。

1. [Google AI Studio](https://aistudio.google.com/)等で Gemini API キーを取得します。
2. ターミナルで `worker` ディレクトリに移動します。
   ```bash
   cd worker
   ```
3. Cloudflareのアカウントでログインします（初回のみ）。
   ```bash
   npx wrangler login
   ```
4. Gemini APIキーを秘密裏に登録します。
   ```bash
   npx wrangler secret put GEMINI_API_KEY
   ```
   （プロンプトが表示されたらAPIキーを貼り付けます）
5. Workerをデプロイします。
   ```bash
   npx wrangler deploy
   ```
6. デプロイ成功時に表示されるURL（例：`https://alima-word...workers.dev`）をメモします。

### フロントエンドの設定とデプロイ
1. ルートディレクトリにある `app.js` の17行目付近、`API_URL` の値を、先ほどメモしたWorkerのURLに変更します。
   ```javascript
   const API_URL = "https://[あなたのWorkerのURL]"; 
   ```
2. このリポジトリ全体をGitHubにPushします。
3. GitHubリポジトリの **[Settings]** > **[Pages]** を開きます。
4. **Source** を `Deploy from a branch` に設定し、**Branch** を `main`（または使用しているメインのブランチ）を選んで **[Save]** します。
5. 1〜2分後、発行されたGitHub PagesのURLにアクセスすれば完成です！

## 📄 使用技術
* HTML / CSS / Vanilla JavaScript
* Cloudflare Workers (バックエンドプロキシ設定)
* Google Gemini API (gemini-2.5-flash)

## 🎨 デザインについて
昨今のブラウザパーティゲーム（デヴィエーション・ゲーム等）を参考に、ネオブルータリズム風の図太いボーダーとビビッドなカラーリングを採用しています。

---
Created for Alima's Friends😎
