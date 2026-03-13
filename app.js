document.addEventListener('DOMContentLoaded', () => {
    const inputEl = document.getElementById('wordInput');
    const generateBtn = document.getElementById('generateBtn');
    const chatArea = document.getElementById('alimaChatArea');
    const speechBubble = document.getElementById('speechBubble');
    const thinkingDots = document.getElementById('thinkingDots');
    const actionButtons = document.getElementById('actionButtons');
    const alimaAvatar = document.getElementById('alimaAvatar');
    const resultWordEl = document.getElementById('resultWord');
    const tweetBtn = document.getElementById('tweetBtn');
    const copyBtn = document.getElementById('copyBtn');

    // 凡例（ハードコードしてあるため完全一致で出力）
    const dictionary = {
        "アドバンスドヴァリアントダンジョン": "ドバヴァジョ",
        "セブンイレブン": "セブブン",
        "ファントムウェポン": "ンポン"
    };

    const API_URL = "https://alima-word-generator-api.h4npen.workers.dev"; 

    async function generateAlimaWordAI(input) {
        const cleanInput = input.replace(/[\s　]+/g, '');
        if (!cleanInput) return "";

        if (dictionary[cleanInput]) {
            return dictionary[cleanInput];
        }

        try {
            if (API_URL === "https://[YOUR_WORKER_URL]" || !API_URL) {
                console.warn("API_URLが設定されていません。");
                return "（未設定）"; 
            }

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
            
            // "Please retry in 54.132s" のような文字列を探す
            const retryMatch = error.message.match(/Please retry in ([0-9.]+\w+)/);
            const waitTime = retryMatch ? `（あと ${retryMatch[1]} ほど待ってお試しください）` : "（1分ほど待ってお試しください）";

            return `疲れてねむねむにゃんこだにゃん。\n${waitTime}`;
        }
    }

    async function doGenerate() {
        const text = inputEl.value;
        if (!text.trim()) return;

        // UIを初期化・ローディング状態にする
        generateBtn.disabled = true;
        generateBtn.style.opacity = '0.5';
        generateBtn.style.cursor = 'not-allowed';

        // 吹き出しとアバターの状態を「考え中」にする
        chatArea.classList.remove('hidden');
        actionButtons.classList.add('hidden');
        resultWordEl.classList.add('hidden');
        thinkingDots.classList.remove('hidden');
        speechBubble.classList.remove('is-error');
        
        alimaAvatar.classList.remove('is-speaking');
        alimaAvatar.classList.add('is-thinking');

        // AIからの返答を待つ
        let generatedWord = await generateAlimaWordAI(text);
        
        // ユーザー体験のため、最低でも1秒ほど確保する
        await new Promise(resolve => setTimeout(resolve, 800));

        // 状態判定（にゃんこメッセージが含まれる場合はエラー表示）
        const isNyankoError = generatedWord.includes('ねむねむにゃんこ');

        // 結果を表示
        thinkingDots.classList.add('hidden');
        resultWordEl.textContent = generatedWord;
        resultWordEl.classList.remove('hidden');
        
        // アバターを「喋っている」状態にする
        alimaAvatar.classList.remove('is-thinking');
        alimaAvatar.classList.add('is-speaking');

        if (isNyankoError) {
            speechBubble.classList.add('is-error');
            actionButtons.classList.add('hidden');
        } else {
            speechBubble.classList.remove('is-error');
            actionButtons.classList.remove('hidden');
        }

        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
        generateBtn.style.cursor = 'pointer';
        
        // ポップアニメーション
        setTimeout(() => {
            speechBubble.classList.remove('pop-anim');
            void speechBubble.offsetWidth; 
            speechBubble.classList.add('pop-anim');
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
