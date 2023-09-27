const ItemEquip = require('./ItemEquip');
const ItemStackable = require("./ItemStackable");
const itemRepository = require("./ItemRepository");
const ItemType = require("../../common/constValues").Item.Type;

class ItemService {
    #req;
    #itemStackableObject;
    #itemEquipObject;
    #itemRepositoryObject;

    constructor(req) {
        this.#req = req;
        this.#itemRepositoryObject = new itemRepository(req);
        this.#itemStackableObject = new ItemStackable(req, this.#itemRepositoryObject);
        this.#itemEquipObject = new ItemEquip(req, this.#itemRepositoryObject);
    }

    async getAll() {
        return this.#itemRepositoryObject.getAll();
    }

    async saveCacheOnly() {
        await this.#itemStackableObject.setCacheOnly();
        await this.#itemEquipObject.setCacheOnly();
    }

    calculateIncrease(incrItemList) {
        this.#itemStackableObject.incr(incrItemList);
        this.#itemEquipObject.incr(incrItemList);
    }

    calculateDecrease(decrItemList) {
        this.#itemStackableObject.decr(decrItemList);
        this.#itemEquipObject.decr(decrItemList);
    }

    get getQueries() {
        return [...this.#itemStackableObject.getQueries, ...this.#itemEquipObject.getQueries];
    }

    get Stackable() {
        return this.#itemStackableObject;
    }

    get Equip() {
        return this.#itemEquipObject;
    }
}

module.exports = ItemService;

