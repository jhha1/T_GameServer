const db = require('../../database/db');
const cache = require('../../database/cache');
const ConstValues = require("../../common/constValues");
const moment = require("moment");
const Queries = require("../../queries/mapper");

class GachaLevelRepository {
    #req;
    #userId;
    #shardId;

    constructor(req) {
        this.#req = req;
        this.#userId = req.data.userId;
        this.#shardId = req.data.shardId;
    }

    async get() {
        let data = await cache.getGame().HGET(this.#key, this.#hKey);
        data = data ? JSON.parse(data) : null;

        // 캐싱 안되있거나 만료됬으면, 디비값 저장.
        if (!data || data.ttl < moment.utc().unix()) {
            return await this.#loadDB();
        }
        else {
            return data.v;
        }
    }

    async setCacheOnly(originValues, updateValues) {
        for (let origin of originValues) {
            for (let update of updateValues) {
                if (origin.gacha_id === update.gacha_id) {
                    origin = update;
                    break;
                }
            }
        }
        const data = {v:originValues, ttl:this.#expireDt};
        await cache.getGame().HSET(this.#key, [this.#hKey, JSON.stringify(data)]);
    }

    async #loadDB() {
        // 만료됬으면, 디비값 저장.
        let query = [["rowsDB", Queries.GachaLevel.select, [this.#userId]]];

        let { rowsDB } = await db.select(this.#shardId, query);

        // cache 저장
        let data = {v:rowsDB, ttl:this.#expireDt};
        await cache.getGame().HSET(this.#key, [this.#hKey, JSON.stringify(data)]);

        return rowsDB;
    }

    get #key() {
        return `GachaLv`;
    }

    get #hKey() {
        return this.#userId;
    }

    get #expireDt() { // 30분 주기 ttl
        return moment.utc().add(ConstValues.Cache.TTL, 'minutes').unix();
    }
}

module.exports = GachaLevelRepository;

