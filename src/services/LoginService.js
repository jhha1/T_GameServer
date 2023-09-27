const UserService = require("./UserService");
const ItemService = require("./item/ItemService");
const { Item } = require("../common/constValues")
const log = require("../utils/logger");

class LoginService {
    #ItemServiceObject;
    #UserServiceObject;
    constructor(req) {
        this.req = req;
        this.userId = req.session.userId;
        this.shardId = req.session.shardId;

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

            return {
                User:haveUser,
                ItemStackable:haveItemList[Item.Type.Stackable],
            };
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = LoginService;