const helper = require('./helper');
const MonsterTable = {
    _origin: {},

    init: function() {
        const rows = helper.getTable("Monster");
        MonsterTable._origin = rows;
    },

    get: function(id) {
        return MonsterTable._origin[id];
    }
};

module.exports = MonsterTable;