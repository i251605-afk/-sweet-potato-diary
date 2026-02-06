/**
 * storage.js - LocalStorage管理モジュール
 * 
 * さつまいも日記アプリのデータ永続化を担当
 * - 投稿履歴
 * - ポイント情報
 * - 品種情報
 * - ポイント履歴
 */

// ストレージキー
const STORAGE_KEY = 'satsumaimo_diary_data';

// 品種リスト（将来的に色違い対応を想定）
const VARIETIES = [
    '紅はるか',
    '安納芋',
    'シルクスイート',
    '鳴門金時',
    '紅あずま'
];

/**
 * デフォルトのデータ構造
 * @returns {Object} 初期データ
 */
function getDefaultData() {
    return {
        variety: null,           // 割り当て品種
        totalPoints: 0,          // 総ポイント
        posts: [],               // 投稿履歴
        pointHistory: [],        // ポイント獲得履歴
        createdAt: new Date().toISOString(),
        // 将来の拡張用
        userId: null,            // フレンド機能用
        settings: {
            isPublic: false      // 公開設定
        }
    };
}

/**
 * ランダムに品種を選択
 * @returns {string} 品種名
 */
function getRandomVariety() {
    const index = Math.floor(Math.random() * VARIETIES.length);
    return VARIETIES[index];
}

/**
 * ストレージからデータを読み込み
 * @returns {Object} 保存されたデータ、または初期データ
 */
function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('データの読み込みエラー:', e);
    }
    return null;
}

/**
 * ストレージにデータを保存
 * @param {Object} data - 保存するデータ
 */
function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('データの保存エラー:', e);
        // ストレージ容量超過の可能性
        if (e.name === 'QuotaExceededError') {
            alert('ストレージ容量が不足しています。古い投稿を削除してください。');
        }
    }
}

/**
 * アプリの初期化（初回起動時の処理含む）
 * @returns {Object} アプリデータ
 */
function initializeApp() {
    let data = loadData();
    
    // 初回起動時：新しいデータを作成
    if (!data) {
        data = getDefaultData();
        data.variety = getRandomVariety();
        saveData(data);
        console.log(`初回起動: 品種「${data.variety}」が割り当てられました`);
    }
    
    return data;
}

/**
 * 投稿を追加
 * @param {Object} post - 投稿データ { type, content, imageData, date }
 * @param {number} points - 獲得ポイント
 * @returns {Object} 更新後のデータ
 */
function addPost(post, points) {
    const data = loadData();
    
    // 投稿を追加（新しい順で表示するため、先頭に追加）
    const newPost = {
        id: Date.now(),
        ...post,
        date: new Date().toISOString(),
        points: points
    };
    data.posts.unshift(newPost);
    
    // ポイントを加算
    data.totalPoints += points;
    
    // ポイント履歴を追加
    data.pointHistory.unshift({
        id: Date.now(),
        date: new Date().toISOString(),
        points: points,
        type: post.type,
        description: getPointDescription(post.type)
    });
    
    saveData(data);
    return data;
}

/**
 * ポイント獲得の説明文を取得
 * @param {string} type - 投稿タイプ
 * @returns {string} 説明文
 */
function getPointDescription(type) {
    switch (type) {
        case 'diary':
            return '日記を投稿';
        case 'photo':
            return '写真を投稿';
        case 'both':
            return '日記と写真を投稿';
        default:
            return '投稿';
    }
}

/**
 * 投稿一覧を取得
 * @returns {Array} 投稿リスト
 */
function getPosts() {
    const data = loadData();
    return data ? data.posts : [];
}

/**
 * ポイント履歴を取得
 * @returns {Array} ポイント履歴リスト
 */
function getPointHistory() {
    const data = loadData();
    return data ? data.pointHistory : [];
}

/**
 * 現在のポイントを取得
 * @returns {number} 総ポイント
 */
function getTotalPoints() {
    const data = loadData();
    return data ? data.totalPoints : 0;
}

/**
 * 品種を取得
 * @returns {string} 品種名
 */
function getVariety() {
    const data = loadData();
    return data ? data.variety : null;
}

/**
 * データをリセット（デバッグ用）
 */
function resetData() {
    localStorage.removeItem(STORAGE_KEY);
    console.log('データをリセットしました');
}

// エクスポート
window.Storage = {
    initializeApp,
    loadData,
    saveData,
    addPost,
    getPosts,
    getPointHistory,
    getTotalPoints,
    getVariety,
    resetData,
    VARIETIES
};
