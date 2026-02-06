/**
 * app.js - メインアプリケーション
 * 
 * さつまいも日記アプリの画面制御とUIレンダリングを担当
 */

// アプリケーションの状態
let appData = null;

/**
 * アプリケーションの初期化
 */
function initApp() {
    // ストレージからデータを読み込み（初回起動時は品種割り当て）
    appData = Storage.initializeApp();

    // UIを初期化
    renderHeader();
    renderPotatoDisplay();
    renderPointsDisplay();
    renderPostsList();
    renderPointHistory();

    // イベントリスナーを設定
    setupEventListeners();

    // ホーム画面を表示
    showScreen('home');

    console.log('さつまいも日記アプリを起動しました');
}

/**
 * ヘッダーを描画（品種名を表示）
 */
function renderHeader() {
    const varietyElement = document.getElementById('variety-name');
    if (varietyElement && appData) {
        varietyElement.textContent = `品種: ${appData.variety}`;
    }
}

/**
 * さつまいも表示を描画
 */
function renderPotatoDisplay() {
    const container = document.getElementById('potato-container');
    const stageElement = document.getElementById('growth-stage');
    const nextStageElement = document.getElementById('next-stage-info');

    if (!container || !appData) return;

    // さつまいもを表示
    const stage = Potato.updatePotatoDisplay(appData.totalPoints, container);

    // 成長段階を表示
    if (stageElement) {
        stageElement.textContent = stage.name;
    }

    // 次の成長段階情報を表示
    if (nextStageElement) {
        const nextInfo = Potato.getNextStageInfo(appData.totalPoints);
        if (nextInfo) {
            nextStageElement.textContent = `次の段階「${nextInfo.nextStage.name}」まであと${nextInfo.pointsNeeded}pt`;
        } else {
            nextStageElement.textContent = '最大成長に達しました！🎉';
        }
    }
}

/**
 * ポイント表示を描画
 */
function renderPointsDisplay() {
    const pointsElement = document.getElementById('total-points');
    if (pointsElement && appData) {
        pointsElement.textContent = appData.totalPoints;
    }
}

/**
 * 投稿一覧を描画
 */
function renderPostsList() {
    const container = document.getElementById('posts-list');
    if (!container) return;

    const posts = Storage.getPosts();

    if (posts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <p class="empty-state-text">まだ投稿がありません<br>日記を書いてさつまいもを育てよう！</p>
            </div>
        `;
        return;
    }

    container.innerHTML = posts.map(post => createPostCard(post)).join('');
}

/**
 * 投稿カードのHTMLを生成
 * @param {Object} post - 投稿データ
 * @returns {string} HTML文字列
 */
function createPostCard(post) {
    const date = formatDate(post.date);
    const typeLabel = getPostTypeLabel(post.type);

    let contentHtml = '';

    // 日記テキスト
    if (post.content) {
        contentHtml += `<p class="card-content">${escapeHtml(post.content)}</p>`;
    }

    // 画像
    if (post.imageData) {
        contentHtml += `<img src="${post.imageData}" alt="投稿画像" class="card-image">`;
    }

    return `
        <article class="card">
            <div class="card-header">
                <span class="card-points">+${post.points}pt</span>
                <span class="card-date">${date}</span>
            </div>
            ${contentHtml}
        </article>
    `;
}

/**
 * ポイント履歴を描画
 */
function renderPointHistory() {
    const container = document.getElementById('point-history-list');
    if (!container) return;

    const history = Storage.getPointHistory();

    if (history.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <p class="empty-state-text">まだポイント履歴がありません</p>
            </div>
        `;
        return;
    }

    container.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="history-info">
                <div class="history-description">${item.description}</div>
                <div class="history-date">${formatDate(item.date)}</div>
            </div>
            <div class="history-points">+${item.points}pt</div>
        </div>
    `).join('');
}

/**
 * イベントリスナーを設定
 */
function setupEventListeners() {
    // ナビゲーション
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const screen = e.currentTarget.dataset.screen;
            if (screen) {
                showScreen(screen);
            }
        });
    });

    // 投稿ボタン
    const postBtn = document.getElementById('post-btn');
    if (postBtn) {
        postBtn.addEventListener('click', () => showScreen('post'));
    }

    // 投稿フォーム
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', handlePostSubmit);
    }

    // 画像アップロード
    const imageInput = document.getElementById('image-input');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageSelect);
    }

    // 画像クリア
    const clearImageBtn = document.getElementById('clear-image-btn');
    if (clearImageBtn) {
        clearImageBtn.addEventListener('click', clearImagePreview);
    }

    // 戻るボタン
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => showScreen('home'));
    });
}

/**
 * 画面を切り替え
 * @param {string} screenId - 表示する画面のID
 */
function showScreen(screenId) {
    // 全画面を非表示
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // 指定画面を表示
    const targetScreen = document.getElementById(`${screenId}-screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }

    // ナビゲーションのアクティブ状態を更新
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.screen === screenId) {
            item.classList.add('active');
        }
    });

    // 投稿画面を開いた時はフォームをリセット
    if (screenId === 'post') {
        resetPostForm();
    }
}

/**
 * 投稿フォームの送信処理
 * @param {Event} e - イベントオブジェクト
 */
function handlePostSubmit(e) {
    e.preventDefault();

    const diaryInput = document.getElementById('diary-input');
    const content = diaryInput ? diaryInput.value.trim() : '';
    const imageData = getSelectedImageData();

    // 何も入力されていない場合
    if (!content && !imageData) {
        showMessage('日記または写真を入力してください', 'error');
        return;
    }

    // 投稿タイプを判定
    const postType = Points.determinePostType(!!content, !!imageData);
    const points = Points.calculatePoints(postType);

    // 投稿を保存
    const post = {
        type: postType,
        content: content || null,
        imageData: imageData || null
    };

    appData = Storage.addPost(post, points);

    // UI更新
    renderPotatoDisplay();
    renderPointsDisplay();
    renderPostsList();
    renderPointHistory();

    // 成功メッセージを表示
    showMessage(`投稿しました！ +${points}pt 🎉`, 'success');

    // さつまいもアニメーション
    const potatoContainer = document.getElementById('potato-container');
    if (potatoContainer) {
        potatoContainer.classList.add('bounce');
        setTimeout(() => potatoContainer.classList.remove('bounce'), 500);
    }

    // ホーム画面に戻る
    setTimeout(() => showScreen('home'), 1500);
}

/**
 * 画像選択処理
 * @param {Event} e - イベントオブジェクト
 */
function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
        showMessage('画像サイズは5MB以下にしてください', 'error');
        e.target.value = '';
        return;
    }

    // 画像をBase64に変換してプレビュー
    const reader = new FileReader();
    reader.onload = (event) => {
        const previewContainer = document.getElementById('image-preview');
        const uploadArea = document.querySelector('.image-upload');

        if (previewContainer) {
            previewContainer.innerHTML = `<img src="${event.target.result}" alt="プレビュー">`;
            previewContainer.classList.remove('hidden');
        }

        // クリアボタンを表示
        const clearBtn = document.getElementById('clear-image-btn');
        if (clearBtn) {
            clearBtn.classList.remove('hidden');
        }
    };
    reader.readAsDataURL(file);
}

/**
 * 画像プレビューをクリア
 */
function clearImagePreview() {
    const previewContainer = document.getElementById('image-preview');
    const imageInput = document.getElementById('image-input');
    const clearBtn = document.getElementById('clear-image-btn');

    if (previewContainer) {
        previewContainer.innerHTML = '';
        previewContainer.classList.add('hidden');
    }

    if (imageInput) {
        imageInput.value = '';
    }

    if (clearBtn) {
        clearBtn.classList.add('hidden');
    }
}

/**
 * 選択された画像のBase64データを取得
 * @returns {string|null} Base64データまたはnull
 */
function getSelectedImageData() {
    const previewImg = document.querySelector('#image-preview img');
    return previewImg ? previewImg.src : null;
}

/**
 * 投稿フォームをリセット
 */
function resetPostForm() {
    const diaryInput = document.getElementById('diary-input');
    if (diaryInput) {
        diaryInput.value = '';
    }
    clearImagePreview();
}

/**
 * メッセージを表示
 * @param {string} text - メッセージテキスト
 * @param {string} type - メッセージタイプ ('success' | 'error')
 */
function showMessage(text, type) {
    // 既存のメッセージを削除
    const existing = document.querySelector('.success-message');
    if (existing) {
        existing.remove();
    }

    const message = document.createElement('div');
    message.className = 'success-message';
    message.textContent = text;

    if (type === 'error') {
        message.style.background = '#e74c3c';
    }

    document.body.appendChild(message);

    // 2秒後に消去
    setTimeout(() => {
        message.remove();
    }, 2000);
}

/**
 * 日付をフォーマット
 * @param {string} dateString - ISO日付文字列
 * @returns {string} フォーマット済み文字列
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}`;
}

/**
 * 投稿タイプのラベルを取得
 * @param {string} type - 投稿タイプ
 * @returns {string} ラベル
 */
function getPostTypeLabel(type) {
    const labels = {
        diary: '日記',
        photo: '写真',
        both: '日記+写真'
    };
    return labels[type] || '投稿';
}

/**
 * HTMLエスケープ
 * @param {string} text - エスケープするテキスト
 * @returns {string} エスケープ済みテキスト
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

// DOMContentLoaded時にアプリを初期化
document.addEventListener('DOMContentLoaded', initApp);
