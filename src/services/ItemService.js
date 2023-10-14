const e = require('express');
const db = require('../database/db');
const Queries = require('../queries/mapper');
const log = require("../utils/logger");

class ItemService {
    constructor(req) {
        this.req = req;
        this.userId = req.session.userId;
        this.shardId = req.session.shardId;
    }

    async itemUseOnly (useItemId, useItemCount, opt={decr:false}) {
        let query = [
            ["haveItem", Queries.ItemStackable.selectWithId, [this.userId, useItemId]]
        ]
        let { haveItem } = await db.select(this.shardId, query); 
        
        haveItem = (haveItem && haveItem.length > 0)? haveItem[0] : {count: 0};

        if (Number(haveItem.count) < useItemCount) {
            log.error(this.req, `FailedChangeShape. InsufficiantBalance. have:${haveItem.count}, need:${useItemCount}`);
            throw 100200; // 소모 아이템 부족
        }

        // 아이템 소모
        haveItem.count = Number(haveItem.count) - useItemCount;

        let executeQueries = [];
        if (opt.decr) {
            executeQueries.push([Queries.ItemStackable.decrese, [useItemCount, this.userId, useItemId]]);
        } else {
            executeQueries.push([Queries.ItemStackable.update, [haveItem.count, this.userId, useItemId]]);
        }

        await db.execute(this.shardId, executeQueries);

        return haveItem;
    }
}

module.exports = ItemService;