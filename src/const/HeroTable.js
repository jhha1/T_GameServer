const helper = require("./helper");
const HeroTable = {
    _origin: {},

    init: function() {
        const rows = helper.getTable("Hero");
        HeroTable._origin = rows;
    },

    get: function(id) {
        return HeroTable._origin[id];
    }
};


module.exports = HeroTable;
