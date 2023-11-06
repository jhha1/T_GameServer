const constValues = {
    DBShard: {
        MaxUserCount: 300000
    },

    DBName: {
        Auth: 'auth',
        Game: 'game0'
    },

    Session: {
        AliveTime: 86400000 // 하루
    },

    Cache: {
        TTL: 1800, // 30분
        LockTTL: 60, // 60 sec
        RefreshTTL: 10, // 10초
    },

    PlatformType: {
        Guest: 1,
        Google: 2
    },

    DeviceType: {
        aos: 1,
        ios: 2
    },

    Item: {
        Type: {
            None: 0,
            Stackable: 100000,
            Emoji: 200000,
        },
        TypeName: {
            None: "None",
            Stackable: "Stackable",
            Emoji: "Emoji",
        },
        Stackable: {
            Gold: 100001,
            DIA: 100002,
        }
    },

    Stage: {
        Type: {
            Friend: 1,
            Random: 2
        },
    },

    Rank: {
        Type: {
            Score: 1,
            WinStreak: 2
        },
    },
}

module.exports = constValues;