const Queries = require('../../queries/mapper');
const ConstTables = require("../../const/mapper");
const log = require("../../utils/logger");
const GachaLevelRepository = require("./GachaLevelRepository");

class GachaLevel {
    #req;
    #userId;
    #shardId;
    #data;
    #GachaLevelRepository;
    #updateCashValues;
    #executeQueries;

    constructor(req) {
        this.#req = req;
        this.#userId = req.data.userId;
        this.#shardId = req.data.shardId;

        // for get
        this.#data = null;
        this.#GachaLevelRepository = new GachaLevelRepository(req);

        // for set
        this.#updateCashValues = [];
        this.#executeQueries = [];
    }
    async get() {
        if (!this.#data) {
            this.#data = await this.#GachaLevelRepository.get();
        }

        return this.#data;
    }
    async getByGachaType(gachaType) {
        let data = await this.get();
        let found = data?.findIndex(x => Number(x.gacha_type) === gachaType);
        return found > -1 ? data[found] : null;
    }
    async calculatePoint(gachaId, gachaType, gachaCount) {
        let userGachaLevelInfo = await this.getByGachaType(gachaType);

        // 1. 데이터가 없을경우
        if (!userGachaLevelInfo) {
            this.#executeQueries.push([Queries.GachaLevel.insert, [this.#userId, gachaId, 1, gachaCount]]);
            this.#updateCashValues.push({user_id:this.#userId, gacha_id:gachaId, level:1, point:gachaCount});
            return;
        }

        let userGachaLevel = userGachaLevelInfo.level ?? 1;
        let userGachaPoint = userGachaLevelInfo.point ?? 0;
        let newPoint = userGachaPoint + gachaCount; // Point 누적

        // 2. 만렙
        const C_GachaLevelMax = ConstTables.GachaLevel.getMaxLevel(gachaType);
        if (C_GachaLevelMax <= userGachaLevel) {
            // Point만 누적
            this.#executeQueries.push([Queries.GachaLevel.update, [userGachaLevel, newPoint, this.#userId, gachaId]]);
            this.#updateCashValues.push({user_id:this.#userId, gacha_id:gachaId, level:userGachaLevel, point:newPoint});
            return;
        }

        // 3. 그 외
        const C_CurrentGachaLevel = ConstTables.GachaLevel.get(gachaType, userGachaLevel);
        const C_NextGachaLevel = ConstTables.GachaLevel.get(gachaType, userGachaLevel + 1);
        if (!C_CurrentGachaLevel || !C_NextGachaLevel) {
            log.error(this.#req, `NoExist_In_C_GachaLevel. gachaType:${gachaType}, userGachaLevel:${userGachaLevel}`);
            throw 99999; // 기획데이터에 없는 소환 타입,레벨
        }

        if (C_NextGachaLevel.point <= C_CurrentGachaLevel.point + newPoint) {
            // 렙업
            userGachaLevel += 1;
            userGachaPoint = newPoint - C_NextGachaLevel.point;
        }
        else {
            // Point만 누적
            userGachaPoint = newPoint;
        }

        this.#executeQueries.push([Queries.GachaLevel.update, [userGachaLevel, userGachaPoint, this.#userId, gachaId]]);
        this.#updateCashValues.push({user_id:this.#userId, gacha_id:gachaId, level:userGachaLevel, point:userGachaPoint});
    }

    async setCacheOnly() {
        await this.#GachaLevelRepository.setCacheOnly(this.#data, this.#updateCashValues);
    }

    get getQueries() {
        return this.#executeQueries;
    }

    get getCashValuesForUpdate() {
        return this.#updateCashValues;
    }
}

module.exports = GachaLevel;

