document.addEventListener('DOMContentLoaded', () => {
    const inputEl = document.getElementById('wordInput');
    const generateBtn = document.getElementById('generateBtn');
    const chatArea = document.getElementById('alimaChatArea');
    const speechBubble = document.getElementById('speechBubble');
    const thinkingDots = document.getElementById('thinkingDots');
    const actionButtons = document.getElementById('actionButtons');
    const alimaAvatar = document.getElementById('alimaAvatar');
    const statusTag = document.getElementById('alimaStatusTag');
    const resultWordEl = document.getElementById('resultWord');
    const tweetBtn = document.getElementById('tweetBtn');
    const copyBtn = document.getElementById('copyBtn');

    const randomStatuses = [
        "ヤニ休憩中🚬",
        "ドカ食い気絶中🍖",
        "ねむねむにゃんこだにゃん",
        "エナドリ充填中⚡"
    ];

    const keywordEggs = {
        "やばい": "やばくね～よ☆",
        "タバコ": "ヤニ吸って落ち着けにゃん🚬",
        "ヤニ": "ヤニ吸って落ち着けにゃん🚬",
        "ドカ食い": "ドカ食い気絶部に入部するにゃん？🍖",
        "二郎": "野菜マシマシ気絶丸だにゃん🍜",
        "眠い": "一回寝るのが正解だにゃん...💤",
        "寝不足": "一回寝るのが正解だにゃん...💤",
        "エナドリ": "エナドリは命の前借りだにゃん！⚡",
        "モンスター": "エナドリは命の前借りだにゃん！⚡",
        "モンエナ": "エナドリは命の前借りだにゃん！⚡"
    };

    // 凡例（ハードコードしてあるため完全一致で出力）
    const dictionary = {
        "アドバンスドヴァリアントダンジョン": "ドバヴァジョ",
        "ヴァリアントダンジョン": "ヴァリダン",
        "ファミリーマート": "ファミリマ",
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

    // アバタータップでのイースターエッグは「略す！」への誘導のため削除


    async function doGenerate() {
        const text = inputEl.value.trim();
        if (!text) return;

        // UIを初期化・ローディング状態にする
        generateBtn.disabled = true;
        generateBtn.style.opacity = '0.5';
        generateBtn.style.cursor = 'not-allowed';

        // 吹き出しとアバターの状態を「考え中」にする
        speechBubble.classList.remove('hidden'); 
        chatArea.classList.remove('hidden');
        actionButtons.classList.add('hidden');
        resultWordEl.textContent = ''; 
        resultWordEl.classList.add('hidden');
        thinkingDots.classList.remove('hidden');
        speechBubble.classList.remove('is-error');
        
        alimaAvatar.classList.remove('is-speaking');
        alimaAvatar.classList.add('is-thinking');

        // ステータスタグの表示（ランダム）
        statusTag.textContent = randomStatuses[Math.floor(Math.random() * randomStatuses.length)];
        statusTag.classList.remove('hidden');

        // イースターエッグのチェック（AIに聞く前にチェック）
        let specialResponse = "";
        for (const key in keywordEggs) {
            if (text.includes(key)) {
                specialResponse = keywordEggs[key];
                break;
            }
        }

        let generatedWord = "";
        if (specialResponse) {
            generatedWord = specialResponse;
        } else {
            // AIからの返答を待つ
            generatedWord = await generateAlimaWordAI(text);
        }
        
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
