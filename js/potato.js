/**
 * potato.js - さつまいも成長ロジック
 * 
 * ポイントに応じた成長段階とビジュアル制御を担当
 */

// さつまいも画像パス（品種ごとの画像）
const POTATO_IMAGES = {
    '紅はるか': './assets/beniharuka.png',
    '安納芋': './assets/annoimo.png',
    'シルクスイート': './assets/silksweet.png',
    '鳴門金時': './assets/narutokintoki.png',
    '紅あずま': './assets/beniazuma.png',
    'default': './assets/beniharuka.png' // フォールバック
};
const SPROUT_IMAGE_PATH = './assets/potato_sprout.png';

// 成長段階の設定
const GROWTH_STAGES = [
    { name: '芽', minPoints: 0, maxPoints: 3, scale: 0.5, useSprout: true },
    { name: '小さい芋', minPoints: 4, maxPoints: 8, scale: 0.6, useSprout: false },
    { name: '中くらいの芋', minPoints: 9, maxPoints: 20, scale: 0.8, useSprout: false },
    { name: '大きい芋', minPoints: 21, maxPoints: 50, scale: 1.0, useSprout: false },
    { name: '巨大芋', minPoints: 51, maxPoints: Infinity, scale: 1.0, useSprout: false }
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
 * @param {string} [variety] - 品種名（省略可能）
 */
function updatePotatoDisplay(points, container, variety) {
    const stage = getGrowthStage(points);
    const scale = calculateScale(points);

    // 画像パスを選択
    let imagePath;
    if (stage.useSprout) {
        imagePath = SPROUT_IMAGE_PATH;
    } else {
        // 品種に基づいた画像、またはデフォルト
        imagePath = POTATO_IMAGES[variety] || POTATO_IMAGES['default'];
    }

    // コンテナをクリア
    container.innerHTML = '';

    // 画像要素を作成
    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = variety ? `${variety} (${stage.name})` : stage.name;
    img.className = 'potato-image';
    img.style.transform = `scale(${scale})`;
    img.style.transition = 'transform 0.5s ease-out';

    // 画像ロードエラー時のフォールバック（デバッグ用）
    img.onerror = function () {
        console.warn(`画像が見つかりません: ${imagePath}`);
        // 既存のSVGがあればそれにフォールバック（任意）
        // this.src = './assets/potato.svg'; 
    };

    container.appendChild(img);

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
    GROWTH_STAGES
};
};
