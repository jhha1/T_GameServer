module.exports = {
    init: () => { return; },

    getTable: (tableName) => {
        return CONST_TABLE[tableName] ?? [];
    }
};