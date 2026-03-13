document.addEventListener('DOMContentLoaded', () => {
    const inputEl = document.getElementById('wordInput');
    const generateBtn = document.getElementById('generateBtn');
    const resultSection = document.getElementById('resultSection');
    const resultWordEl = document.getElementById('resultWord');
    const tweetBtn = document.getElementById('tweetBtn');
    const copyBtn = document.getElementById('copyBtn');

    // 凡例（ハードコードしてあるため完全一致で出力）
    const dictionary = {
        "アドバンスドヴァリアントダンジョン": "ドバヴァジョ",
        "セブンイレブン": "セブブン",
        "ファントムウェポン": "ンポン"
    };

    // ==========================================================
    // Cloudflare WorkerのURLを設定してください
    // 例: https://alima-word-generator-api.your-account.workers.dev
    // ==========================================================
    const API_URL = "https://alima-word-generator-api.h4npen.workers.dev"; 
    // ※デプロイするまでは、このURLを空文字などにしておくと通信できません

    async function generateAlimaWordAI(input) {
        const cleanInput = input.replace(/[\s　]+/g, '');
        if (!cleanInput) return "";

        // 凡例に完全一致する場合は固定の略語を返す
        if (dictionary[cleanInput]) {
            return dictionary[cleanInput];
        }

        try {
            // API URLが未設定のままボタンを押された際のダミー処理（Workerデプロイ後削除してOK）
            if (API_URL === "https://[YOUR_WORKER_URL]" || !API_URL) {
                console.warn("API_URLが設定されていません。WorkerをデプロイしURLをapp.jsに記載してください。");
                return "（未設定）"; 
            }

            // Cloudflare WorkerのAPIへリクエスト
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: cleanInput })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const detail = errorData.error || response.statusText;
                throw new Error(`API呼び出しに失敗しました (${response.status} ${detail})`);
            }

            const data = await response.json();
            return data.result || "エラー";

        } catch (error) {
            console.error('AIの生成に失敗:', error);
            // エラー文に429やQuotaが含まれていた場合（制限超過）
            if (error.message && (error.message.includes('429') || error.message.includes('Quota'))) {
                return "考えすぎて疲れてねむねむにゃんこだにゃん。\n今は頭がいっぱいになっちゃったから、1分くらい待っててほしいにゃん！";
            }
            return "通信エラー";
        }
    }

    async function doGenerate() {
        const text = inputEl.value;
        if (!text.trim()) return;

        // UIをローディング状態にする
        resultSection.classList.add('hidden');
        generateBtn.disabled = true;
        generateBtn.style.opacity = '0.5';
        generateBtn.style.cursor = 'not-allowed';
        document.getElementById('avatarSection').classList.remove('hidden');

        // AIからの返答を待つ
        let generatedWord = await generateAlimaWordAI(text);
        
        // ユーザー体験のため、ローディングアニメーションを最低でも1秒ほど確保する
        await new Promise(resolve => setTimeout(resolve, 1000));
            
        resultWordEl.textContent = generatedWord;
        
        // ローディングを解除して結果を表示
        document.getElementById('avatarSection').classList.add('hidden');
        resultSection.classList.remove('hidden');
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
        generateBtn.style.cursor = 'pointer';
        
        // アニメーションを確実に再発火させるための遅延
        setTimeout(() => {
            resultWordEl.classList.remove('pop-anim');
            void resultWordEl.offsetWidth; // 強制リフロー
            resultWordEl.classList.add('pop-anim');
        }, 10);
    }

    generateBtn.addEventListener('click', doGenerate);
    
    inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            doGenerate();
        }
    });

    tweetBtn.addEventListener('click', () => {
        const originalText = inputEl.value.trim();
        const generatedText = resultWordEl.textContent;
        const tweetText = `「${originalText}」をAlima語で言うと...\n\n『${generatedText}』\n\n#Alima語ジェネレーター\n`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(url, '_blank');
    });

    copyBtn.addEventListener('click', async () => {
        const generatedText = resultWordEl.textContent;
        try {
            await navigator.clipboard.writeText(generatedText);
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'コピー完了！';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        } catch (err) {
            alert('コピーに失敗しました');
        }
    });
});
