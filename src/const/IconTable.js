const helper = require("./helper");
const IconTable = {
    _map: {},

    init: function() {
        const rows = helper.getTable("Icon");
        for (let row of rows) {
            IconTable._map[row.id] = row;
        }
    },

    get: function(id) {
        return IconTable._map[id] || null;
    },

    iconIdList: function() {
        return Object.keys(IconTable._map);
    }
};


module.exports = IconTable;