const moment = require('moment');
const db = require('../database/db');
const Queries = require('../queries/mapper');
const cache = require('../database/cache');
const KeyValuesTable = require('../const/KeyValuesTable');
const util = require("../utils/util");
const log = require("../utils/logger");

class StageService {
    constructor(req) {
        this.req = req;
        this.userId = req.session.userId;
        this.shardId = req.session.shardId;
        this.season = req.body.season;

        this.myStageInfo = null;
        this.myItemStackableInfo = [];
        this.newWinCount = 0;
        this.newLoseCount = 0;
    }

    async finish(roomKey, isWin) {
        let { roomInfo, isDone } = await this.#getCacheInfo( roomKey );

        this.#check( roomInfo, isWin, isDone );

        await this.#fetch( isWin );

        let queries = this.#updateQueries( isWin );

        if (queries.length > 0) {
            await db.execute(this.shardId, queries);

            if (isWin) {
                let newMyRank = this.#calcMyRank();
                await cache.getGame().zAdd(this.rankingKey(this.season), newMyRank, this.userId);
            }

            await cache.getGame().setEx(this.userDoneKey(roomKey), 3, 1); // ttl: 2 hours 60*60*2
        }
    }

    #check(roomInfo, isWin, isDone) {
        if (!roomInfo) {
            log.error(`FailedFriendPlayFinish. noExistRoom`);
            throw 100007; // 플레이한 룸 정보가 없다. 핵?
        }

        let found = roomInfo.findIndex((x) => x.user_id === this.userId);
        if (found === -1) {
            log.error(`FailedFriendPlayFinish. I was not the player`);
            throw 100008; // 내가 플레이한게 아닌데? 핵?
        }

        if (isDone) {
            log.error(`FailedFriendPlayFinish. already finished`);
            throw 100010; // 이미 종료된게임
        }

        if (isWin) {
            if (roomInfo.length === 1) {
                log.error(`FailedFriendPlayFinish. player is only one. Invalid WIN`);
                throw 100011; // 혼자 플레이하고 이길수없다
            }
        }
    }

    async #fetch(isWin) {
        if (isWin) {
            let queries = [
                ["StageRow", Queries.Stage.selectByUserIdAndSeason, [this.season, this.userId]],
                ["ItemStackableRows", Queries.ItemStackable.selectByUserId, [this.userId]]
            ];

            const { StageRow, ItemStackableRows } = await db.select(this.shardId, queries);

            if (StageRow.length === 0) {
                log.error(`FailedFriendPlayFinish. NoExist StageDB`);
                throw 105;
            }

            if (ItemStackableRows.length === 0) {
                log.error(`FailedFriendPlayFinish. NoExist ItemStackableDB`);
                throw 105;
            }

            this.myStageInfo = StageRow[0];
            this.myItemStackableInfo = ItemStackableRows;
        }
        else {
            let queries = [
                ["StageRow", Queries.Stage.selectByUserIdAndSeason, [this.season, this.userId]]
            ];

            const { StageRow } = await db.select(this.shardId, queries);

            if (StageRow.length === 0) {
                log.error(`FailedFriendPlayFinish. NoExist StageDB`);
                throw 105;
            }

            this.myStageInfo = StageRow[0];
        }
    }

    #updateQueries(isWin) {
        let executeQueries = [];

        if (isWin) {
            // score
            const addScore = KeyValuesTable.get('StageWinScore') || 0;
            const newScore = this.myStageInfo.score + addScore;
            const newWinCount = this.myStageInfo.win + 1;

            executeQueries.push([Queries.Stage.updateWin, [newWinCount, newScore, this.userId, this.season]]);

            // reward
            const rewardList = KeyValuesTable.get('StageWinReward') || [];
            for (let reward of rewardList) {
                if (!reward[0] || !reward[1]) continue;

                let rewardItemId = reward[0];
                let rewardItemCount = reward[1];
                let found = this.myItemStackableInfo.findIndex((x) => x.item_id === rewardItemId);
                if (found > -1) {
                    let newItemCount = this.myItemStackableInfo[found].count + rewardItemCount;
                    executeQueries.push([Queries.ItemStackable.update, [newItemCount, this.userId, rewardItemId]]);
                }
                else {
                    let newItemCount = rewardItemCount;
                    executeQueries.push([Queries.ItemStackable.insert, [newItemCount, this.userId, rewardItemId]]);
                }
            }

            this.newWinCount = newWinCount;
        }
        else {
            this.newLoseCount = this.myStageInfo.lose + 1;

            executeQueries.push([Queries.Stage.updateLose, [this.newLoseCount, this.userId, this.season]]);
        }

        return executeQueries;
    }

    #calcMyRank() {
        const now = moment.utc().format('x');
        const buf = Buffer.allocUnsafe(8);
        buf.writeUInt32BE(this.newWinCount, 0);
        buf.writeUInt32BE(util.INT_MAX - now / 1000, 4);
        return Number(buf.readBigUInt64BE(0));
    }

    async getRoomInfo(roomKey) {
        if (!roomKey) return null;

        let roomInfo = await cache.getGame().get(roomKey);
        if (roomInfo) {
            return JSON.parse(roomInfo);
        }

        return null;
    }

    async #getCacheInfo(roomKey) {
        if (!roomKey) return null;

        let roomInfo = null;
        let isDone = null;
        let data = await cache.getGame().mGet([roomKey, this.userDoneKey(roomKey)]);
        if (data) {
            roomInfo = JSON.parse(data[0]);
            isDone = data[1];
        }

        return { roomInfo, isDone };
    }

    async getMyRank(season) {
        let myRank = await cache.getGame().zRevRank(this.rankingKey(season), this.userId);

        return (myRank !== null)? myRank : -1;
    }

    async getMyRankAndScore(season) {
        const cacheKey = this.rankingKey(season);

        let [myRank, myScore] = await Promise.all([cache.getGame().zRevRank(cacheKey, this.userId), cache.getGame().zScore(cacheKey, this.userId)]);
        myRank = (myRank !== null)? myRank : -1;
        myScore = (myScore !== null)? Number(BigInt(myScore) >> 32n) : 0;

        return { myRank, myScore };
    }

    rankingKey(season) {
        if (!season) {
            season = KeyValuesTable.get('CurrentSeason') || 0;
        }

        return `R:${season}`;
    }

    userDoneKey(roomKey) {
        return `${roomKey}:${this.userId}`;
    }

    get stageInfo() {
        return this.myStageInfo;
    }

    get itemStackableInfo() {
        return this.myItemStackableInfo;
    }

    async rankInfo() {
        return await this.getMyRank(this.season);
    }
}

module.exports = StageService;