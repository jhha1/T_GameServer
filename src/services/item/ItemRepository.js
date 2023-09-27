const db = require('../../database/db');
const cache = require('../../database/cache');
const Queries = require('../../queries/mapper');
const ConstValues = require("../../common/constValues");
const ItemType = require("../../common/constValues").Item.Type;
const ItemTypeName = require("../../common/constValues").Item.TypeName;
const Item = require("./Item");

class ItemRepository {
    #req;
    #userId;
    #shardId;
    constructor(req) {
        this.#req = req;
        this.#userId = req.session.userId;
        this.#shardId = req.session.shardId;
    }

    async get(itemType, itemId) {
        let data = await cache.getGame().HGET(this.cacheKey(itemType), itemId);
        if (!data) {
            data = await this.#loadDB(itemType);
            return Array.isArray(data)? data.find((x) => x.item_id === itemId) : null;
        }
        else {
            return JSON.parse(data[1]);
        }
    }

    async mGet(itemType, itemIdList) {
        let data = await cache.getGame().HGET(this.cacheKey(itemType), itemIdList);
        if (!data || Object.keys(data).length === 0) {
            data = await this.#loadDB(itemType);
            return data.filter(d => itemIdList.includes(d.item_id));
        }
        else {
            data = Object.values(data).map((x) => JSON.parse(x));
            return data;
        }
    }

    async getAll() {
        let result = {};

        for (let itemType of Object.values(ItemType)) {
            if (itemType === ItemType.None) continue;

            result[itemType] = await this.#_getAll(itemType);
        }

        return result;
    }

    async gatAllByItemTypes(itemTypes) {
        if (Array.isArray(itemTypes)) {
            let result = {};
            for (let itemType of itemTypes) {
                result[itemType] = await this.#_getAll(itemType);
            }

            return result;
        }
        else {
            let itemType = itemTypes;
            return await this.#_getAll(itemType);
        }
    }

    async #_getAll(itemType) {
        if (!Item.checkItemType(itemType)) {
            console.error(this.#req, `InvalidItemType: ${itemType}`);
            throw 999999;
        }

        let data = await cache.getGame().HGETALL(this.cacheKey(itemType));
        if (!data || Object.keys(data).length === 0) {
            return await this.#loadDB(itemType);
        } else {
            data = Object.values(data).map((x) => JSON.parse(x));
            return data;
        }
    }

    async setAllCacheOnly(data) {
        if (!data || !Array.isArray(data)) {
            console.error(this.#req, `FailedSaveCache. NoData or InvalidFormat. ${data}`);
            // throw 999999;
            return;
        }

        for (let d of data) {
            await this.mSetCacheOnly(d.type, d.v);
        }
    }

    async mSetCacheOnly(itemType, updateCashValues) {
        if (!Item.checkItemType(itemType)) {
            console.error(this.#req, `FailedSaveCache. InvalidItemType: ${itemType}`);
            throw 999999;
        }

        if (!updateCashValues || updateCashValues.length === 0) {
            return;
        }

        //if (await cache.isExpired(this.cacheKey(itemType))) {
        //    await this.#loadDB(itemType); // 이때 캐시에 set도 하므로
        //}
        //else {
            let data = [];
            for (let row of updateCashValues) {
                data.push(String(row.item_id));
                data.push(JSON.stringify(row));
            }
            await cache.getGame().HSET(this.cacheKey(itemType), data);
            await cache.getGame().EXPIRE(this.cacheKey(itemType), ConstValues.Cache.TTL);
        //}
    }

    async #loadDB(itemType) {
        // 만료됬으면, 디비값 저장.
        let query = [["rowsDB", this.selectQuery(itemType), [this.#userId]]];

        let { rowsDB } = await db.select(this.#shardId, query);

        if (rowsDB.length > 0) {
            // cache 저장
            let data = [];
            for (let row of rowsDB) {
                data.push(String(row.item_id));
                data.push(JSON.stringify(row));
            }

            await Promise.all([
                await cache.getGame().HSET(this.cacheKey(itemType), data),
                await cache.getGame().EXPIRE(this.cacheKey(itemType), ConstValues.Cache.TTL)
            ]);
        }

        return rowsDB;
    }

    cacheKey(itemType) {
        if (itemType === ItemType.Stackable) {
            return `Item:S:${this.#userId}`;
        }
        else if (itemType === ItemType.Equip) {
            return `Item:E:${this.#userId}`;
        }
        else if (itemType === ItemType.FloatingPoint) {
            return `Item:F:${this.#userId}`;
        }
    }
    selectQuery(itemType) {
        if (itemType === ItemType.Stackable) {
            return Queries.ItemStackable.select;
        }
        else if (itemType === ItemType.Equip) {
            return Queries.ItemEquip.select;
        }
        else if (itemType === ItemType.FloatingPoint) {
            return Queries.ItemDouble.select;
        }
    }
}

module.exports = ItemRepository;

