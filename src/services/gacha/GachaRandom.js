class GachaRandom {
    constructor() {}

    static grade(gachaType) {
        switch(gachaType) {
            case ConstValues.Gacha.Type.ItemEquip:
                return util.Random.GachaGradeItemEquip.quick();
            case ConstValues.Gacha.Type.Skill:
                return util.Random.GachaGradeSkill.quick();
            case ConstValues.Gacha.Type.Pet:
                return util.Random.GachaGradePet.quick();
            default:
                return util.Random.GachaGradeItemEquip.quick();
        }
    }

    static item(gachaType) {
        switch(gachaType) {
            case ConstValues.Gacha.Type.ItemEquip:
                return util.Random.GachaItemEquip.quick();
            case ConstValues.Gacha.Type.Skill:
                return util.Random.GachaItemSkill.quick();
            case ConstValues.Gacha.Type.Pet:
                return util.Random.GachaItemPet.quick();
            default:
                return util.Random.GachaItemEquip.quick();
        }
    }
}

module.exports = GachaRandom;