const moment = require('moment');
const db = require('../database/db');
const cache = require('../database/cache');
const Queries = require('../queries/mapper');
const util = require('../utils/util');
const log = require("../utils/logger");

class MatchRandomService {
    constructor(req, myIp) {
        this.req = req;
        this.userId = req.data.userId;
        this.shardId = req.data.shardId;
        this.season = req.data.season;
        this.myIP = myIp;
        this.playerInfos = [];
        this.roomKey = '';
    }

    async matching() {
        let me = await this.getMyInfo();

        let matchTarget = await cache.getGame().rPop(this.queueKey);
        if (!matchTarget) {
            await cache.getGame().lPush(this.queueKey, JSON.stringify(me));

            this.playerInfos.push(me);
        }
        else {
            matchTarget = JSON.parse(matchTarget);
            if (matchTarget.user_id === this.userId) {
                await cache.getGame().lPush(this.queueKey, JSON.stringify(me));

                this.playerInfos.push(me);
            }
            else {
                await this.createRoom(me, matchTarget);
            }
        }
    }

    async createRoom(me, matchTarget) {
        const roomKey = this.makeRoomKey();
        const roomInfo = [me, matchTarget];
        const roomInfoJson = JSON.stringify(roomInfo);

        await cache.getGame().set( roomKey, roomInfoJson );
        await cache.getGame().expire( roomKey, 60*60 ); // 레거시 데이터 관리용. 1 hour 뒤에 리얼 방폭.

        this.roomKey = roomKey;
        this.playerInfos.push(me);
        this.playerInfos.push(matchTarget);
    }

    async deleteMeFromWaitingQueue() {
        let waitingUser = await cache.getGame().rPop(this.queueKey);
        if (waitingUser) {
            waitingUser = JSON.parse(waitingUser);
            if (waitingUser.user_id === this.userId) {
                ; // 대기큐에 있던게 나면 이미 pop 으로 삭제됫음.
            } else {
                // 대기큐에 있던게 딴애면 다시 큐에 넣어줌. 나는 삭제 못함.
                await cache.getGame().lPush(this.queueKey, JSON.stringify(waitingUser));
            }
        }
    }

    async getMyInfo() {
        let query = [
            ["UserRow", Queries.User.selectByUserId, [this.userId]],
            ["StageRow", Queries.Stage.selectByUserId, [this.userId]]
        ];

        let { UserRow, StageRow } = await db.select(this.shardId, query);

        if (UserRow.length === 0 || StageRow.length === 0) {
            log.error(`FailedCreateFriendRoom. User of Stage db row is Empty`);
            throw 100004; // data 이상
        }

        let myRank = 0;

        return {user_id: UserRow[0].user_id, ip: this.myIP, nickname: "no Name", emote_id: UserRow[0].emote_id, rank: myRank, win: StageRow[0].win, lose: StageRow[0].lose, result:0};
    }

    makeRoomKey() {
        return `RR:${moment.utc().format('x')}${util.sysRangeRand(10,99)}`; // RR: random room
    }

    get queueKey() {
        return `RMQ:${this.season}`; // RMQ: random match queue
    }

    get uniqueRoomKey() {
        return this.roomKey;
    }

    get playerList() {
        return this.playerInfos;
    }
}


module.exports = MatchRandomService;