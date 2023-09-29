const moment = require('moment');
const db = require('../database/db');
const Queries = require('../queries/mapper');
const cache = require('../database/cache');
const KeyValuesTable = require('../const/KeyValuesTable');
const log = require("../utils/logger");

class StageService {
    constructor(req, roomKey, isWin) {
        this.req = req;
        this.userId = req.session.userId;
        this.shardId = req.session.shardId;
        this.roomKey = roomKey;
        this.isWin = isWin;
        this.season = 0;
    }

    async FriendPlayFinish() {
        let roomInfo = await cache.getMatch().get(this.roomKey);
        if (!roomInfo) {
            log.error(`FailedFriendPlayFinish. noExistRoom`);
            throw 100007; // 플레이한 룸 정보가 없다. 핵?
        }
        roomInfo = JSON.parse(roomInfo);
        
        let found = roomInfo.findIndex((x) => x.user_id === this.userId);
        if (!found) {
            log.error(`FailedFriendPlayFinish. I was not the player`);
            throw 100008; // 내가 플레이한게 아닌데? 핵?
        }

        this.season = KeyValuesTable.get('CurrentSeason') || 0;

        let executeQuery = [];

        if (this.isWin) {
            const getScore = KeyValuesTable.get('StageWinScore') || 0;
            const getRewards = KeyValuesTable.get('StageWinReward') || [];

            executeQuery.push([Queries.Stage.updateWin, [getScore, this.userId, this.season]]);
            for (let reward of getRewards) {
                executeQuery.push([Queries.ItemStackable.increase, [this.userId, reward[0], reward[1]]]);
            }
        } 
        else {
            executeQuery.push([Queries.Stage.updateLose, [this.userId, this.season]]);
        }

        await db.execute(this.shardId, executeQuery);

        await cache.getMatch().expire(this.roomKey, 60*60); // 2명 다 finish 프로토콜에서 방유무 확인하므로 지우진 않고,, 1시간 뒤에 리얼 방폭.
    }

    async result() {
        let queries = [
            ["StageRow", Queries.Stage.selectByUserIdAndSeason, [this.userId, this.season]],
            ["ItemStackableRows", Queries.ItemStackable.selectByUserId, [this.userId]]
        ];

        const { StageRow, ItemStackableRows } = await db.select(this.shardId, queries);

        return {
            stage: StageRow[0],
            item_stackable: ItemStackableRows,
            my_rank: 0
        }
    }
}


module.exports = StageService;