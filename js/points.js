/**
 * points.js - ポイント計算モジュール
 * 
 * 投稿タイプに応じたポイント計算を担当
 */

// ポイント設定（将来的に変更しやすいよう定数化）
const POINT_CONFIG = {
    diary: 2,    // 日記のみ: 2ポイント
    photo: 1,    // 写真のみ: 1ポイント
    both: 3      // 日記+写真: 3ポイント
};

/**
 * 投稿タイプに応じたポイントを計算
 * @param {string} type - 投稿タイプ ('diary', 'photo', 'both')
 * @returns {number} 獲得ポイント
 */
function calculatePoints(type) {
    return POINT_CONFIG[type] || 0;
}

/**
 * 投稿内容からタイプを判定
 * @param {boolean} hasDiary - 日記があるか
 * @param {boolean} hasPhoto - 写真があるか
 * @returns {string|null} 投稿タイプ
 */
function determinePostType(hasDiary, hasPhoto) {
    if (hasDiary && hasPhoto) {
        return 'both';
    } else if (hasDiary) {
        return 'diary';
    } else if (hasPhoto) {
        return 'photo';
    }
    return null;
}

/**
 * ポイントの説明テキストを取得
 * @param {string} type - 投稿タイプ
 * @returns {string} 説明テキスト
 */
function getPointsText(type) {
    const points = POINT_CONFIG[type];
    if (!points) return '';

    const typeText = {
        diary: '日記',
        photo: '写真',
        both: '日記+写真'
    };

    return `${typeText[type]}投稿: +${points}pt`;
}

// エクスポート
window.Points = {
    calculatePoints,
    determinePostType,
    getPointsText,
    POINT_CONFIG
};
