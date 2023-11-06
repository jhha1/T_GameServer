const _ = require("lodash");

const INT_MAX = Math.pow(2, 32) - 1;

const Random = {
    GachaGradeItemEquip: null, // 등급 선택
    GachaGradeItemWeapon: null,
    GachaGradeItemArmor: null,
    GachaGradeSkill: null,
    GachaGradePet: null,
    GachaItemEquip: null, // 동 등급 내 아이템 선택
    GachaItemWeapon: null,
    GachaItemArmor: null,
    GachaItemSkill: null,
    GachaItemPet: null,
};

// min이상 ~ max이하 사이의 난수 생성
function sysRangeRand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mergeDuplicatedItems(itemList) {
    // 중복아이템 합산
    let merged = [];
    const list = itemList;
    for (let i = 0, k = 0; i < list.length; i++) {
        if (merged.find((e) => e.id === list[i].id)) continue;
        merged[k] = _.cloneDeep(list[i]);
        for (let j = 0; j < list.length; j++) {
            if (i !== j && list[i].id === list[j].id) {
                merged[k].count += list[j].count;
            }
        }
        k++;
    }
    return merged;
}

module.exports.INT_MAX = INT_MAX;
module.exports.Random = Random;
module.exports.mergeDuplicatedItems = mergeDuplicatedItems;
module.exports.sysRangeRand = sysRangeRand;
