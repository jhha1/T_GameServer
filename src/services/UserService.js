const Queries = require('../queries/mapper');
const moment = require("moment");
const ConstTables = require("../const/mapper");
const log = require("../utils/logger");
const db = require("../database/db");

class UserService {

    #UserObject;

    constructor(req) {
        this.req = req;
        this.userId = req.session.userId;
        this.shardId = req.session.shardId;

        this.#UserObject = null;
    }

    isEmpty() {
        return !this.#UserObject;
    }

    async getUser() {
        if (this.isEmpty()) {
            let query = [
                ["UserRow", Queries.User.selectByUserId, [this.userId]]
            ];

            let {UserRow} = await db.select(this.shardId, query);

            this.#UserObject = UserRow[0] ?? [];
        }

        return this.#UserObject;
    }

    createUser(shardId, userId) {
        const now = moment.utc().format('x');

        let heroInitData = ConstTables.KeyValues.get("UserCreateHero");
        let itemStackableInitData = ConstTables.KeyValues.get("UserCreateItemStackable");
        let itemStackableQueryData = (itemStackableInitData)? itemStackableInitData.flatMap(data => [userId, ...data]) : [];

        // 유저 생성시 같이 생성되어야 할 다른 디비로우도 추가
        // ...

        let newUserQuery = [[Queries.User.insert, [userId, shardId, now, now]]];
        if (itemStackableQueryData.length > 0) newUserQuery.push([Queries.ItemStackable.insertMany(itemStackableInitData.length), itemStackableQueryData]);

        return newUserQuery;
    }
}

module.exports = UserService;