const helper = require("./helper");
const GachaLevelTable = {
    _listByGachaType: {},
    _maxLevelByGachaType: {},

    init: function() {
        const rows = helper.getTable("GachaLevel");
        for (let row of rows) {
            if (!GachaLevelTable._listByGachaType[row.type]) GachaLevelTable._listByGachaType[row.type] = [];
            GachaLevelTable._listByGachaType[row.type].push(row);
        }

        // 소환별 최대 도달 레벨
        for (let type of Object.keys(GachaLevelTable._listByGachaType)) {
            let maxLevel = Math.max(...GachaLevelTable._listByGachaType[type].map((x) => x.level));
            GachaLevelTable._maxLevelByGachaType[type] = maxLevel;
        }
    },

    get: function(gachaType, level=null) {
        if (!level) {
            return GachaLevelTable._listByGachaType[gachaType];
        }
        else {
            return (GachaLevelTable._listByGachaType[gachaType] && GachaLevelTable._listByGachaType[gachaType].length > 0)
                ? GachaLevelTable._listByGachaType[gachaType].find((x) => x.level === level)
                : null;
        }
    },

    getMaxLevel(gachaType) {
        return GachaLevelTable._maxLevelByGachaType[gachaType];
    }
};


module.exports = GachaLevelTable;
