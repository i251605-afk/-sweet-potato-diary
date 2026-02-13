/**
 * potato.js - さつまいも成長ロジック
 * 
 * ポイントに応じた成長段階とビジュアル制御を担当
 */

// さつまいも画像パス（差し替え可能）
const POTATO_IMAGE_PATH = './assets/beni_haruka.png';
const SMALL_POTATO_IMAGE_PATH = './assets/small_potato.png';
const SPROUT_IMAGE_PATH = './assets/sprout.svg';

// 成長段階の設定
// 成長段階の設定
const GROWTH_STAGES = [
    { name: '芽', minPoints: 0, maxPoints: 3, scale: 0.5, useSprout: true, useSmall: false },
    { name: '小さい芋', minPoints: 4, maxPoints: 8, scale: 0.6, useSprout: false, useSmall: true },
    { name: '中くらいの芋', minPoints: 9, maxPoints: 20, scale: 0.8, useSprout: false, useSmall: false },
    { name: '大きい芋', minPoints: 21, maxPoints: 50, scale: 1.0, useSprout: false, useSmall: false },
    { name: '巨大芋', minPoints: 51, maxPoints: Infinity, scale: 1.0, useSprout: false, useSmall: false }
];

/**
 * ポイントから成長段階を取得
 * @param {number} points - 現在のポイント
 * @returns {Object} 成長段階情報
 */
function getGrowthStage(points) {
    for (const stage of GROWTH_STAGES) {
        if (points >= stage.minPoints && points <= stage.maxPoints) {
            return stage;
        }
    }
    // デフォルト（最大成長）
    return GROWTH_STAGES[GROWTH_STAGES.length - 1];
}

/**
 * ポイントからスケールを計算（101pt以降は段階的に増加）
 * @param {number} points - 現在のポイント
 * @returns {number} スケール値
 */
function calculateScale(points) {
    const stage = getGrowthStage(points);

    // 101pt以降は段階的にサイズ増加
    if (points > 100) {
        // 50ptごとに0.1ずつ増加（最大2.0まで）
        const extraScale = Math.min((points - 100) / 50 * 0.1, 1.0);
        return stage.scale + extraScale;
    }

    return stage.scale;
}

/**
 * さつまいもの表示を更新
 * @param {number} points - 現在のポイント
 * @param {HTMLElement} container - 表示コンテナ
 */
function updatePotatoDisplay(points, container) {
    const stage = getGrowthStage(points);
    const scale = calculateScale(points);

    // 画像パスを選択（段階に応じて別画像）
    let imagePath = POTATO_IMAGE_PATH;
    if (stage.useSprout) {
        imagePath = SPROUT_IMAGE_PATH;
    } else if (stage.useSmall) {
        imagePath = SMALL_POTATO_IMAGE_PATH;
    }

    // コンテナをクリア
    container.innerHTML = '';

    // 画像要素を作成
    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = stage.name;
    img.className = 'potato-image';
    img.style.transform = `scale(${scale})`;
    img.style.transition = 'transform 0.5s ease-out';

    container.appendChild(img);

    // 成長段階のテキストを更新（外部で行う）
    return stage;
}

/**
 * 次の成長段階までのポイントを計算
 * @param {number} points - 現在のポイント
 * @returns {Object} { nextStage, pointsNeeded } or null
 */
function getNextStageInfo(points) {
    const currentStage = getGrowthStage(points);
    const currentIndex = GROWTH_STAGES.indexOf(currentStage);

    // 最大成長段階の場合
    if (currentIndex >= GROWTH_STAGES.length - 1) {
        return null;
    }

    const nextStage = GROWTH_STAGES[currentIndex + 1];
    const pointsNeeded = nextStage.minPoints - points;

    return {
        nextStage: nextStage,
        pointsNeeded: pointsNeeded
    };
}

/**
 * 成長進捗率を取得（現在の段階内での進捗）
 * @param {number} points - 現在のポイント
 * @returns {number} 0-100のパーセンテージ
 */
function getGrowthProgress(points) {
    const stage = getGrowthStage(points);

    // 最大成長段階の場合は100%
    if (stage.maxPoints === Infinity) {
        return 100;
    }

    const stageRange = stage.maxPoints - stage.minPoints + 1;
    const currentProgress = points - stage.minPoints;

    return Math.min(Math.round((currentProgress / stageRange) * 100), 100);
}

// エクスポート
window.Potato = {
    getGrowthStage,
    calculateScale,
    updatePotatoDisplay,
    getNextStageInfo,
    getGrowthProgress,
    POTATO_IMAGE_PATH,
    SMALL_POTATO_IMAGE_PATH,
    SPROUT_IMAGE_PATH,
    GROWTH_STAGES
};
