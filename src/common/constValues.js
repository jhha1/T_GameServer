const constValues = {
    DBShard: {
        MaxUserCount: 300000
    },

    DBName: {
        Auth: 'jhha_auth',
        Game: 'jhha_game0'
    },

    Session: {
        AliveTime: 86400000 // 하루
    },

    Cache: {
        TTL: 1800, // 30분
        RefreshTTL: 10, // 10초
    },

    PlatformType: {
        Guest: 1,
        Google: 2,
        FaceBook: 3
    },

    DeviceType: {
        aos: 1,
        ios: 2
    },

    Item: {
        Type: {
            None: 0,
            FloatingPoint: 100001,
            Stackable: 100000,
            Equip: 200000,
        },
        TypeName: {
            None: "None",
            FloatingPoint: "FloatingPoint",
            Stackable: "Stackable",
            Equip: "Equip",
        },
        Stackable: {
            Gold: 100001,
            DIA: 100002,
        }
    },

    Stage: {
        Type: {
            Normal: 1,
        },
        PlayLimitTime: 2000, // ms
        StageStart: 1,
        SubStageStart: 1,
        SubStageMax: 5,
        SubStageBoss: 5,
        GoldBufferPercent: 10,
    },

    Gacha: {
        Type: {
            ItemEquip: 1,
            ItemWeapon: 2,
            ItemArmor: 3,
            Item1: 4,
            Item2: 5,
            Item3: 6,
            Skill: 7,
            Pet: 8,
            All: 9
        }
    }
}

module.exports = constValues;