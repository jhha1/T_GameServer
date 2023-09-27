const helper = require("./helper");
const PetTable = {
    _origin: {},

    init: function() {
        const rows = helper.getTable("Pet");
        PetTable._origin = rows;
    },

    get: function(id) {
        return PetTable._origin[id];
    }
};


module.exports = PetTable;