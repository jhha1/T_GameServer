const helper = require("./helper");
const GachaProbTable = {
    _listByGachaId: {},
    _probSumByGachaId: {},

    init: function() {
        const rows = helper.getTable("GachaProb");
        for (let row of rows) {
            if (!GachaProbTable._listByGachaId[row.gacha_id]) GachaProbTable._listByGachaId[row.gacha_id] = {};
            if (!GachaProbTable._listByGachaId[row.gacha_id][row.gacha_level]) GachaProbTable._listByGachaId[row.gacha_id][row.gacha_level] = [];
            GachaProbTable._listByGachaId[row.gacha_id][row.gacha_level].push(row);
        }

        // 소환 종류별 확률 총합
        for (const gachaId of Object.keys(GachaProbTable._listByGachaId)) {
            for (const gachaLevel of Object.keys(GachaProbTable._listByGachaId[gachaId])) {
                if (!GachaProbTable._probSumByGachaId[gachaId]) GachaProbTable._probSumByGachaId[gachaId] = {};
                GachaProbTable._probSumByGachaId[gachaId][gachaLevel] = GachaProbTable._listByGachaId[gachaId][gachaLevel].reduce((sum, row) => sum + row.prob, 0);
            }
        }
    },

    get: function(gachaId, gachaLevel) {
        return GachaProbTable._listByGachaId[gachaId]?.[gachaLevel] ?? null;
    },

    getProbSum: function(gachaId, gachaLevel) {
        return GachaProbTable._probSumByGachaId[gachaId]?.[gachaLevel] ?? null;
    }
};

module.exports = GachaProbTable;
