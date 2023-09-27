const helper = require("./helper");
const ItemEquipLevelUpTable = {
    _listByGrade: {},
    _maxLevelByGrade: {},

    init: function() {
        const rows = helper.getTable("ItemEquipLevelUp");
        for (let row of rows) {
            if (!ItemEquipLevelUpTable._listByGrade[row.grade]) ItemEquipLevelUpTable._listByGrade[row.grade] = [];
            ItemEquipLevelUpTable._listByGrade[row.grade].push(row);
        }

        // 장착 등급별 최대 도달 레벨
        for (let grade of Object.keys(ItemEquipLevelUpTable._listByGrade)) {
            let maxLevel = Math.max(...ItemEquipLevelUpTable._listByGrade[grade].map((x) => x.level));
            ItemEquipLevelUpTable._maxLevelByGrade[grade] = maxLevel;
        }
    },

    get: function(grade, level=null) {
        if (!level) {
            return ItemEquipLevelUpTable._listByGrade[grade];
        }
        else {
            return (ItemEquipLevelUpTable._listByGrade[grade] && ItemEquipLevelUpTable._listByGrade[grade].length > 0)
                ? ItemEquipLevelUpTable._listByGrade[grade].find((x) => x.level === level)
                : null;
        }
    },

    getMaxLevel(grade) {
        return ItemEquipLevelUpTable._maxLevelByGrade[grade];
    }
};


module.exports = ItemEquipLevelUpTable;
