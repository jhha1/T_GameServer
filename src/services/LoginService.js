const UserRepository = require("./user/UserRepository");
const ItemRepository = require("./item/ItemRepository");
const ConstValues = require("../common/constValues")
const log = require("../utils/logger");

class LoginService {
    #UserRepositoryObject;
    #ItemRepositoryObject;
    constructor(req) {
        this.req = req;
        this.userId = req.session.userId;
        this.shardId = req.session.shardId;

        this.#UserRepositoryObject = new UserRepository(req);
        this.#ItemRepositoryObject = new ItemRepository(req);
    }
    async getLoginData() {
        try {
            const haveUser = await this.#UserRepositoryObject.getUser();
            if (haveUser.length === 0) {
                log.error(this.req, `NoExistUser. userId:${this.userId}`);
                throw 999999;
            }

            const haveItemList = await this.#ItemRepositoryObject.getAll();

            return {
                User:haveUser,
                ItemEquip:haveItemList[ConstValues.Item.Type.Equip],
                ItemStackable:haveItemList[ConstValues.Item.Type.Stackable],
                ItemFloatingPoint:haveItemList[ConstValues.Item.Type.FloatingPoint]
            };
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = LoginService;