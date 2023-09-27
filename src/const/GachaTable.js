const helper = require("./helper");
const GachaTable = {
    _objectByGachaId: {},

    init: function() {
        const rows = helper.getTable("Gacha");
        for (let row of rows) {
            GachaTable._objectByGachaId[row.id] = row;
        }
    },

    get: function(gachaId) {
        return GachaTable._objectByGachaId[gachaId];
    }
};


module.exports = GachaTable;
