const ItemStackable = require("./ItemStackable");
const Queries = require("../../queries/mapper");
const log = require("../../utils/logger");
const db = require("../../database/db");
const { Item } = require("../../common/constValues");

class ItemService {
    #req;
    #userId;
    #shardId;
    #itemStackableObject;

    constructor(req) {
        this.#req = req;
        this.#userId = req.session.userId;
        this.#shardId = req.session.shardId;
        this.#itemStackableObject = new ItemStackable(req);
    }

    async getStackable() {
        return await this.#itemStackableObject.get();
    }

    async getAll() {
        let queries = [
            ["ItemStackable", Queries.ItemStackable.selectByUserId, [this.#userId]]
        ];

        let { ItemStackable } = await db.select(this.#shardId, queries);

        this.#itemStackableObject.set(ItemStackable);

        const result = {};
        result[Item.Type.Stackable] = ItemStackable;

        return result;
    }

    increaseStackable(incrItemList) {
        this.#itemStackableObject.incr(incrItemList);
    }

    decreaseStackable(incrItemList) {
        this.#itemStackableObject.decr(incrItemList);
    }

    increaseMulti(incrItemList) {
        this.#itemStackableObject.incr(incrItemList);
    }

    decreaseMulti(decrItemList) {
        this.#itemStackableObject.decr(decrItemList);
    }

    get getQueries() {
        return [...this.#itemStackableObject.getQueries];
    }
}

module.exports = ItemService;

