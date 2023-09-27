const Queries = require('../../queries/mapper');
const Item = require("./Item");
const ItemType = require("../../common/constValues").Item.Type;
const util = require("../../utils/util");
const log = require("../../utils/logger");

class ItemStackable extends Item {
    #itemRepositoryObject;
    #itemStackableRows;
    #executeQueries;
    #updateCashValues;

    constructor(req, itemRepositoryObject) {
        super(req);

        this.#itemRepositoryObject = itemRepositoryObject;

        this.#itemStackableRows = null;
        this.#executeQueries = [];
        this.#updateCashValues = [];
    }

    isEmpty() {
        return !this.#itemStackableRows;
    }

    has (itemId) {
        return this.#itemStackableRows.findIndex((x) => x.item_id === itemId) > -1;
    }

    async get(itemIdList=null) {
        if (this.isEmpty()) {
            this.#itemStackableRows = await this.#itemRepositoryObject.gatAllByItemTypes(ItemType.Stackable);
        }

        if (!itemIdList) {
            return this.#itemStackableRows;
        }
        else if (itemIdList.length === 1) {
            return this.#itemStackableRows.find((x) => x.item_id === itemIdList[0]);
        }
        else {
            return this.#itemStackableRows.filter(d => itemIdList.includes(d.item_id));
        }
    }


    async setCacheOnly() {
        await this.#itemRepositoryObject.mSetCacheOnly(ItemType.Stackable, this.#updateCashValues);
    }

    incr(incrItemList) {
        const incrList = incrItemList.filter((x) => Item.isStackableItem(x.id));
        const mergedIncrList = util.mergeDuplicatedItems(incrList);
        for (let incr of mergedIncrList) {
            let found = this.#itemStackableRows.findIndex((x) => x.item_id === incr.id);
            if (found === -1) {
                this.#executeQueries.push([Queries.ItemStackable.insert, [this.userId, incr.id, incr.count]]);
                this.#updateCashValues.push({user_id:this.userId, item_id:incr.id, count:incr.count});

                this.#itemStackableRows.push({user_id:this.userId, item_id:incr.id, count:incr.count});
            }
            else {
                let item = this.#itemStackableRows[found];
                item.count += incr.count;

                this.#executeQueries.push([Queries.ItemStackable.update, [item.count, this.userId, incr.id]]);
                this.#updateCashValues.push({user_id:this.userId, item_id:incr.id, count:item.count});

                this.#itemStackableRows[found].count = item.count;
            }
        }
    }

    decr(decrItemList) {
        const decrList = decrItemList.filter((x) => Item.isStackableItem(x.id));
        const mergedDecrList = util.mergeDuplicatedItems(decrList);
        for (let decr of mergedDecrList) {
            let found = this.#itemStackableRows.findIndex((x) => x.item_id === decr.id);
            if (found === -1) {
                log.error(this.req, `InsufficientBalance. id:${decr.id}, needCount:${decr.count}, haveCount:0`);
                throw 99999;
            }

            let item = this.#itemStackableRows[found];
            if (item.count < decr.count) {
                log.error(this.req, `InsufficientBalance. id:${decr.id}, needCount:${decr.count}, haveCount:${item.count}`);
                throw 99999;
            }

            item.count -= decr.count;

            this.#executeQueries.push([Queries.ItemStackable.update, [item.count, this.userId, decr.id]]);
            this.#updateCashValues.push({user_id:this.userId, item_id:decr.id, count:item.count});

            this.#itemStackableRows[found].count = item.count;
        }
    }

    get getQueries() {
        return this.#executeQueries;
    }

    get getCashValuesForUpdate() {
        return this.#updateCashValues;
    }
}

module.exports = ItemStackable;

