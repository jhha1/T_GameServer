const helper = require("./helper");
const ItemEquipTable = {
    _listByItemId: {},
    _listByEquipKind: {},
    _listByEquipGrade: {},
    _listByEquipKindAndGrade: {},

    init: function() {
        const rows = helper.getTable("ItemEquip");
        for (let row of rows) {
            if (!ItemEquipTable._listByEquipKind[row.kind])
                ItemEquipTable._listByEquipKind[row.kind] = [];
            if (!ItemEquipTable._listByEquipGrade[row.grade])
                ItemEquipTable._listByEquipGrade[row.grade] = [];
            if (!ItemEquipTable._listByEquipKindAndGrade[row.kind])
                ItemEquipTable._listByEquipKindAndGrade[row.kind] = {};
            if (!ItemEquipTable._listByEquipKindAndGrade[row.kind][row.grade])
                ItemEquipTable._listByEquipKindAndGrade[row.kind][row.grade] = [];

            ItemEquipTable._listByItemId[row.id] = row;
            ItemEquipTable._listByEquipKind[row.kind].push(row);
            ItemEquipTable._listByEquipGrade[row.grade].push(row);
            ItemEquipTable._listByEquipKindAndGrade[row.kind][row.grade].push(row);
        }
    },

    getByItemId: (itemId) => {
        return ItemEquipTable._listByItemId[itemId];
    },

    getByEquipKind: (kind) => {
        return ItemEquipTable._listByEquipKind[kind];
    },

    getListByGrade: (grade) => {
        return ItemEquipTable._listByEquipGrade[grade];
    },

    getByEquipKindAndGrade: (kind, grade) => {
        return ItemEquipTable._listByEquipKind[kind]? ItemEquipTable._listByEquipKind[kind][grade] : [];
    }
};

module.exports = ItemEquipTable;