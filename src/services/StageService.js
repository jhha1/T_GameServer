const moment = require('moment');
const db = require('../database/db');
const Queries = require('../queries/mapper');
const cache = require('../database/cache');
const KeyValuesTable = require('../const/KeyValuesTable');
const ConstValues = require('../common/constValues');
const util = require("../utils/util");
const log = require("../utils/logger");

/*
    한판 끝난 경기에대해 동일유저가 이겼다고 계속 오는거 금지 (2 시간동안) 
    방 자체가 방 생성후.. 1시간 있다 폭파되기 때문에, 
    2시간 금지가 풀리고 win 프로토콜이 와도 방이 없어 실패하고 다 막힘.
*/
const CheckSecAlreadyDone = 60*60*2; 

/*
    한판 끝난 경기에대해 둘 다 이겼다고 오는거 금지 (2 시간동안) 
    방 자체가 방 생성후.. 1시간 있다 폭파되기 때문에, 
    2시간 금지가 풀리고 win 프로토콜이 와도 방이 없어 실패하고 다 막힘.

    둘 다 이겼다고 오면 워닝포인트를 올린다
*/
const CheckSecWinHack = 60*60*2; 

class StageService {
    constructor(req) {
        this.req = req;
        this.userId = req.data.userId;
        this.shardId = req.data.shardId;
        this.season = req.data.season;

        this.myStageInfo = null;
        this.myItemStackableInfo = [];
        this.newScore = 0;
        this.newLoseCount = 0;
    }

    async finish(roomKey, isWin) {
        let { roomInfo, isDone } = await this.#getCacheInfo( roomKey );

        await this.#check( roomInfo, roomKey, isWin, isDone );

        await this.#fetch( isWin );

        let queries = this.#updateQueries( isWin );

        if (queries.length > 0) {
            await db.execute(this.shardId, queries);

            if (isWin) {
                let newMyRank = this.#calcMyRank();
                await cache.getGame().zAdd(this.rankingKey(this.season), {score: newMyRank, value: this.userId});
            }

            await cache.getGame().setEx(this.userDoneKey(roomKey), CheckSecAlreadyDone, '1'); 
        }
    }

    async #check(roomInfo, roomKey, isWin, isDone) {
        if (!roomInfo) {
            log.error(this.req, `FailedPlayFinish. noExistRoom`);
            throw 100007; // 플레이한 룸 정보가 없다. 핵?
        }

        let found = roomInfo.findIndex((x) => x.user_id === this.userId);
        if (found === -1) {
            log.error(this.req, `FailedPlayFinish. I was not the player`);
            throw 100008; // 내가 플레이한게 아닌데? 핵?
        }

        if (isDone) {
            log.error(this.req, `FailedPlayFinish. already finished`);
            throw 100010; // 이미 종료된게임
        }

        if (isWin) {
            if (roomInfo.length === 1) {
                log.error(this.req, `FailedPlayFinish. player is only one. Invalid WIN`);
                throw 100011; // 혼자 플레이하고 이길수없다
            }

            let ret = await cache.getGame().setNX(this.chechWinHackKey(roomKey), '1');
            if (ret === 0) {
                log.error(this.req, `FailedPlayFinish. Already Who was Win`);
                // 워닝 포인트 증가
                // throw 100009; // 둘 다 승리할 수 없다 
            }
            await cache.getGame().expire(this.chechWinHackKey(roomKey), CheckSecWinHack);
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
                log.error(this.req, `FailedFriendPlayFinish. NoExist StageDB`);
                throw 105;
            }

            if (ItemStackableRows.length === 0) {
                log.error(this.req, `FailedFriendPlayFinish. NoExist ItemStackableDB`);
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
                log.error(this.req, `FailedFriendPlayFinish. NoExist StageDB`);
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
            this.myStageInfo.score = Number(this.myStageInfo.score) + Number(addScore);
            this.myStageInfo.win = Number(this.myStageInfo.win) + 1;

            executeQueries.push([Queries.Stage.updateWin, [this.myStageInfo.win, this.myStageInfo.score, this.userId, this.season]]);

            // reward
            const rewardList = KeyValuesTable.get('StageWinReward') || [];
            for (let reward of rewardList) {
                if (!reward[0] || !reward[1]) continue;

                let rewardItemId = reward[0];
                let rewardItemCount = reward[1];
                let newItemCount = 0;
                let found = this.myItemStackableInfo.findIndex((x) => x.item_id === rewardItemId);
                if (found > -1) {
                    newItemCount = this.myItemStackableInfo[found].count + rewardItemCount;
                    executeQueries.push([Queries.ItemStackable.update, [newItemCount, this.userId, rewardItemId]]);
                }
                else {
                    newItemCount = rewardItemCount;
                    executeQueries.push([Queries.ItemStackable.insert, [newItemCount, this.userId, rewardItemId]]);
                }

                this.myItemStackableInfo[found].count = newItemCount;
            }

            this.newScore = this.myStageInfo.score;
        }
        else {
            const loseScore = KeyValuesTable.get('StageLoseScore') || 0;
            this.myStageInfo.score = Number(this.myStageInfo.score) + Number(loseScore);
            if (this.myStageInfo.score < 0) this.myStageInfo.score = 0;
            this.myStageInfo.lose = Number(this.myStageInfo.lose) + 1;

            executeQueries.push([Queries.Stage.updateLose, [this.myStageInfo.lose, this.myStageInfo.score, this.userId, this.season]]);
        }

        return executeQueries;
    }

    async getRoomInfo(roomKey) {
        if (!roomKey) return null;

        let roomInfo = await cache.getGame().get(roomKey);
        if (roomInfo) {
            return JSON.parse(roomInfo);
        }

        return null;
    }

    async getTopRankList(season, rankType) {
        let key = null;
        if (Number(rankType) === ConstValues.Rank.Type.Score) {
            key = this.rankingKey(season);
        }

        let rankList = {};
        let userIdList = [];
        let list = await cache.getGame().sendCommand(['zrevrange', key, '0', '99', 'withscores']);
        if (list) {
            for (let i = 0, rank = 1; i < list.length; i += 2, rank++) {
                let userId = list[i];
                let score = Number(BigInt(list[i+1]) >> 32n) || 0;

                rankList[userId] = {user_id:userId, rank:rank, score:score};
                userIdList.push(userId);
            }
        }

        const placeholders = userIdList.map(() => '?').join(',');
        let queries = [
            ["User", Queries.User.selectByUserIdList(placeholders), userIdList]
        ];

        const userInfoList = await Promise.all(
            ShardIdList.map((shardId) => db.select(shardId, queries)),
        );

        for (let shard of userInfoList) {
            for (let info of shard['User']) {
                rankList[info.user_id].nickname = info.nickname;
                rankList[info.user_id].icon_id = info.emote_id;
            }
        }

        return Object.values(rankList);
    }

    async getMyRankInfo(season) {
        const cacheKey = this.rankingKey(season);

        let [ myRank, myScore ] = await Promise.all([cache.getGame().zRevRank(cacheKey, this.userId), cache.getGame().zScore(cacheKey, this.userId)]);

        let myRankInfo = {};
        myRankInfo['userId'] = this.userId;
        myRankInfo['rank'] = (myRank !== null)? myRank + 1 : 0;
        myRankInfo['score'] = (myScore !== null)? Number(BigInt(myScore) >> 32n) : 0;
        myRankInfo['nickname'] = this.req.data.nickname;
        myRankInfo['icon_id'] = this.req.data.iconId;

        return myRankInfo;
    }

    async getMyRank(season) {
        let myRank = await cache.getGame().zRevRank(this.rankingKey(season), this.userId);

        return (myRank !== null)? myRank + 1: 0;
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

    #calcMyRank() {
        const now = moment.utc().format('x');
        const buf = Buffer.allocUnsafe(8);
        buf.writeUInt32BE(this.newScore, 0);
        buf.writeUInt32BE(util.INT_MAX - now / 1000, 4);
        return Number(buf.readBigUInt64BE(0));
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

    chechWinHackKey(roomKey) {
        return `WH:${roomKey}`; // win hack
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