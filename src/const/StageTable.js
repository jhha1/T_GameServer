const helper = require("./helper");
const StageTable = {
    _origin: {},

    init: function() {
        const rows = helper.getTable("Stage");
        StageTable._origin = rows;
    },

    get: function(id) {
        return StageTable._origin[id];
    }
};


module.exports = StageTable;