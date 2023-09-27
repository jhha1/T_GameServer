const helper = require("./helper");
const keyValuesTable = {
    _map: {},

    init: function() {
        const rows = helper.getTable("KeyValues");
        for (let row of rows) {
            if (Number(row.type) === 1) { // primitive int values
                keyValuesTable._map[row.key] = Number(row.value);
            }
            if (Number(row.type) === 2) { // array
                keyValuesTable._map[row.key] = Array.isArray(row.value)? row.value : JSON.parse(row.value);
            }
        }
    },

    get: function(key) {
        return keyValuesTable._map[key] || null;
    }
};


module.exports = keyValuesTable;