const db = require('../../database/db');
const Queries = require('../../queries/mapper');
const Item = require('./Item');
const ItemType = require("../../common/constValues").Item.Type;
const util = require("../../utils/util");
const log = require("../../utils/logger");

class ItemEquip extends Item {
    #itemRepositoryObject;
    #itemEquipRows;
    #executeQueries;
    #updateCashValues;

    constructor(req, itemRepositoryObject) {
        super(req);

        this.#itemRepositoryObject = itemRepositoryObject;

        this.#itemEquipRows = null;
        this.#executeQueries = [];
        this.#updateCashValues = [];
    }

    isEmpty() {
        return !this.#itemEquipRows;
    }

    has (itemId) {
        return this.#itemEquipRows.findIndex((x) => x.item_id === itemId) > -1;
    }

    async get(itemIdList=null) {
        if (this.isEmpty()) {
            this.#itemEquipRows = await this.#itemRepositoryObject.gatAllByItemTypes(ItemType.Equip);
        }

        if (!itemIdList) {
            return this.#itemEquipRows;
        }
        else if (itemIdList.length === 1) {
            return this.#itemEquipRows.find((x) => x.item_id === itemIdList[0]);
        }
        else {
            return this.#itemEquipRows.filter(d => itemIdList.includes(d.item_id));
        }
    }

    async setCacheOnly() {
        await this.#itemRepositoryObject.mSetCacheOnly(ItemType.Equip, this.#updateCashValues);
    }

    async addDirectly(itemId, grade, level, pieceCount) {
        let query = [
            [Queries.ItemEquip.insert, [this.userId, itemId, grade, level, pieceCount]]
        ];
        await db.execute(this.shardId, query);

        this.#updateCashValues.push({user_id:this.userId, item_id:itemId, grade:grade, level:level, piece_count:pieceCount});
        await this.setCacheOnly(this.#updateCashValues);
    }

    async updateDirectly(itemId, grade, level, pieceCount) {
        let query = [
            [Queries.ItemEquip.update, [level, pieceCount, this.userId, itemId]]
        ];
        await db.execute(this.shardId, query);

        this.#updateCashValues.push({user_id:this.userId, item_id:itemId, grade:grade, level:level, piece_count:pieceCount});
        await this.setCacheOnly(this.#updateCashValues);
    }

    incr(incrItemList) {
        const incrList = incrItemList.filter((x) => Item.isEquipItem(x.id));
        const mergedIncrList = util.mergeDuplicatedItems(incrList);
        for (let incr of mergedIncrList) {
            let found = this.#itemEquipRows.findIndex((x) => x.item_id === incr.id);
            if (found === -1) {
                this.#executeQueries.push([Queries.ItemEquip.insert, [this.userId, incr.id, incr.grade, 1, incr.count]]);
                this.#updateCashValues.push({user_id:this.userId, item_id:incr.id, grade:incr.grade, level:1, piece_count:incr.count});

                this.#itemEquipRows.push({user_id:this.userId, item_id:incr.id, grade:incr.grade, level:1, piece_count:incr.count});
            }
            else {
                let item = this.#itemEquipRows[found];
                item.piece_count += incr.count;

                this.#executeQueries.push([Queries.ItemEquip.update, [item.level, item.piece_count, this.userId, incr.id]]);
                this.#updateCashValues.push({user_id:this.userId, item_id:incr.id, grade:incr.grade, level:item.level, piece_count:item.piece_count});

                this.#itemEquipRows[found].piece_count = item.piece_count;
            }
        }
    }

    decr(decrItemList) {
        const decrList = decrItemList.filter((x) => Item.isEquipItem(x.item_id));
        const mergedDecrList = util.mergeDuplicatedItems(decrList);
        for (let decr of mergedDecrList) {
            let found = this.#itemEquipRows.findIndex((x) => x.item_id === decr.id);
            if (found === -1) {
                log.error(this.req, `InsufficientBalance. id:${decr.id}, needCount:${decr.count}, haveCount:0`);
                throw 99999;
            }

            let item = this.#itemEquipRows[found];
            if (item.count < decr.count) {
                log.error(this.req, `InsufficientBalance. id:${decr.id}, needCount:${decr.count}, haveCount:${item.count}`);
                throw 99999;
            }

            item.count -= decr.count;

            this.#executeQueries.push([Queries.ItemEquip.update, [item.level, item.count, this.userId, item.id]]);
            this.#updateCashValues.push({user_id:this.userId, item_id:item.id, grade:item.grade, level:item.level, piece_count:item.count});

            this.#itemEquipRows[found].count = item.count;
        }
    }

    get getQueries() {
        return this.#executeQueries;
    }

    get getCashValuesForUpdate() {
        return this.#updateCashValues;
    }
}

module.exports = ItemEquip;

