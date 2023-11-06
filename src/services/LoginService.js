const UserService = require("./UserService");
const ItemService = require("./item/ItemService");
const { Item } = require("../common/constValues");
const ConstTables = require("../const/mapper");
const Queries = require('../queries/mapper');
const db = require("../database/db");
const log = require("../utils/logger");

class LoginService {
    #ItemServiceObject;
    #UserServiceObject;
    constructor(req) {
        this.req = req;
        this.userId = req.data.userId;
        this.shardId = req.data.shardId;

        this.#ItemServiceObject = new ItemService(req);
        this.#UserServiceObject = new UserService(req);
    }
    async getLoginData() {
        try {
            const haveUser = await this.#UserServiceObject.getUser();
            if (haveUser.length === 0) {
                log.error(this.req, `NoExistUser. userId:${this.userId}`);
                throw 999999;
            }

            const haveItemList = await this.#ItemServiceObject.getAll();

            /// todo. 위에 다시 정리

            let curSeason = ConstTables.KeyValues.get('CurrentSeason') || 0;

            let queries = [
                ["StageRow", Queries.Stage.selectByUserIdAndSeason, [curSeason, this.userId]]
            ]
            const { StageRow } = await db.select(this.shardId, queries);

            return {
                user: haveUser,
                item_stackable: haveItemList[Item.Type.Stackable],
                stage: StageRow[0]
            };
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = LoginService;