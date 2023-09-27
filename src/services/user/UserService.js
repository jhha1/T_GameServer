const Queries = require('../../queries/mapper');
const moment = require("moment");
const ConstTables = require("../../const/mapper");
const log = require("../../utils/logger");
const UserRepository = require("./UserRepository");

class UserService {

    #UserRepositoryObject;

    constructor(req) {
        this.req = req;
        this.userId = req.session.userId;
        this.shardId = req.session.shardId;

        this.#UserRepositoryObject = new UserRepository(req);
    }

    async getUser() {
        try {
            return await this.#UserRepositoryObject.getUser();
        } catch (err) {
            throw err;
        }
    }

    createUser(shardId, userId) {
        const now = moment.utc().format('x');

        let heroInitData = ConstTables.KeyValues.get("UserCreateHero");
        let itemFloatingPointInitData = ConstTables.KeyValues.get("UserCreateItemFloatingPoint");
        let itemStackableInitData = ConstTables.KeyValues.get("UserCreateItemStackable");
        let itemEquipInitData = ConstTables.KeyValues.get("UserCreateItemEquip");

        let itemFloatingPointCacheData = [];
        let itemFloatingPointQueryData = [];
        if (itemFloatingPointInitData) {
            itemFloatingPointCacheData = itemFloatingPointInitData.map(row => ({user_id:userId, item_id:row[0], amount:row[1]}));
            itemFloatingPointQueryData = itemFloatingPointInitData.flatMap(data => [userId, ...data]);
        }

        let itemStackableCacheData = [];
        let itemStackableQueryData = [];
        if (itemStackableInitData) {
            itemStackableCacheData = itemStackableInitData.map(row => ({user_id:userId, item_id:row[0], count:row[1]}));
            itemStackableQueryData = itemStackableInitData.flatMap(data => [userId, ...data]);
        }

        let itemEquipCacheData = [];
        let itemEquipQueryData = [];
        for (let data of itemEquipInitData) {
            const C_Item = ConstTables.ItemEquip.getByItemId(data[0]);
            itemEquipQueryData.push([userId, C_Item.id, C_Item.grade, 1, data[1]]);
            itemEquipCacheData.push({user_id:userId, item_id:C_Item.id, grade:C_Item.grade, level:1, piece_count:data[1]});
        }
        itemEquipQueryData = itemEquipQueryData.flatMap(data => [...data]);

        // 유저 생성시 같이 생성되어야 할 다른 디비로우도 추가
        // ...

        let newUserQuery = [[Queries.User.insert, [userId, shardId, now, now]]];
        if (itemFloatingPointInitData.length > 0) newUserQuery.push([Queries.ItemDouble.insertMany(itemFloatingPointInitData.length), itemFloatingPointQueryData]);
        if (itemStackableCacheData.length > 0) newUserQuery.push([Queries.ItemStackable.insertMany(itemStackableInitData.length), itemStackableQueryData]);
        if (itemEquipInitData.length > 0) newUserQuery.push([Queries.ItemEquip.insertMany(itemEquipInitData.length), itemEquipQueryData]);

        let cacheData = {};
        if (itemFloatingPointInitData.length > 0) cacheData["itemFloatingPoint"] = itemFloatingPointCacheData;
        if (itemStackableCacheData.length > 0) cacheData["itemStackable"] = itemStackableCacheData;
        if (itemEquipInitData.length > 0) cacheData["itemEquip"] = itemEquipCacheData;

        return {
            newUserQuery,
            cacheData
        };
    }
}

module.exports = UserService;