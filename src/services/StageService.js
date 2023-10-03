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
        let roomInfo = await cache.getGame().get(this.roomKey);
        if (!roomInfo) {
            log.error(`FailedFriendPlayFinish. noExistRoom`);
            throw 100007; // 플레이한 룸 정보가 없다. 핵?
        }
        roomInfo = JSON.parse(roomInfo);
        
        let found = roomInfo.findIndex((x) => x.user_id === this.userId);
        if (found === -1) {
            log.error(`FailedFriendPlayFinish. I was not the player`);
            throw 100008; // 내가 플레이한게 아닌데? 핵?
        }

        if(roomInfo[found].is_finish) {
            log.error(`FailedFriendPlayFinish. already finished`);
            throw 100010; // 이미 종료된게임
        }

        this.season = KeyValuesTable.get('CurrentSeason') || 0;

        let executeQuery = [];

        if (this.isWin) {
            if (roomInfo.length === 1) {
                log.error(`FailedFriendPlayFinish. player is only one. Invalid WIN`);
                throw 100011; // 혼자 플레이하고 이길수없다
            }

            let found2 = roomInfo.findIndex((x) => x.is_finish === 1);
            if (found2 > -1) {
                log.error(`FailedFriendPlayFinish. already target is rewarded`);
                throw 100009; // 상대방유저가 이미 이겼는데 나도 이겼다고 옴? 핵?
                // is_finish - 0:미종료, 1:종료.이김. 2:종료.짐
            }

            const getScore = KeyValuesTable.get('StageWinScore') || 0;
            const getRewards = KeyValuesTable.get('StageWinReward') || [];

            executeQuery.push([Queries.Stage.updateWin, [getScore, this.userId, this.season]]);
            for (let reward of getRewards) {
                executeQuery.push([Queries.ItemStackable.increase, [reward[1],this.userId, reward[0]]]);
            }

            roomInfo[found].is_finish = 1;
        } 
        else {
            executeQuery.push([Queries.Stage.updateLose, [this.userId, this.season]]);

            roomInfo[found].is_finish = 2;
        }

        if (executeQuery.length > 0) {
            await db.execute(this.shardId, executeQuery);
            await cache.getGame().set(this.roomKey, JSON.stringify(roomInfo));
        }
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