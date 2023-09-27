const moment = require('moment');
const db = require('../database/db');
const Queries = require('../queries/mapper');
const ConstValues = require('../common/constValues');

class StageService {
    constructor(req) {
        this.req = req;
        this.userId = req.session.userId;
        this.shardId = req.session.shardId;
    }

    async updateClear(clearStageId, newGoldAmount, warningPoint) {
        let executeQuery = [
            [Queries.Stage.update, [this.userId, ConstValues.Stage.Type.Normal, clearStageId]],
            [Queries.ItemDouble.update, [this.userId, ConstValues.Item.Stackable.Gold, newGoldAmount]]
        ];

        if (warningPoint > 0) { // hack
            this.req.session.warningPoint += warningPoint;
            executeQuery.push([Queries.Hack.insertOrUpdate, [this.userId, this.req.session.warningPoint]]);
        }

        await db.execute(this.shardId, executeQuery);

        this.req.session.stageId = clearStageId;
        this.req.session.goldAmount = newGoldAmount;
        this.req.session.lastStageClearDt = moment.utc().format('x');
    }
}


module.exports = StageService;