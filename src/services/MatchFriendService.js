const moment = require('moment');
const db = require('../database/db');
const cache = require('../database/cache');
const Queries = require('../queries/mapper');
const ConstValues = require('../common/constValues');
const util = require('../utils/util');
const log = require("../utils/logger");

const roomNameRegex = /^[a-zA-Z0-9]+$/;

class MatchFriendService {
    constructor(req, roomName, myIp) {
        this.req = req;
        this.userId = req.session.userId;
        this.shardId = req.session.shardId;
        this.roomName = roomName;
        this.myIP = myIp;
        this.playerInfos = [];
        this.roomKey = '';
    }

    checkRoomName(){
        if (this.roomName.length > 12) {
            log.error(`FailedCreateFriendRoom. InvalidRoomNameLength:${this.roomName}`);
            return 100001; // 최대 12자
        }

        if (!roomNameRegex.test(this.roomName)) {
            log.error(`FailedCreateFriendRoom. InvalidRoomName:${this.roomName}`);
            return 100002; // 영어와 숫자만 가능
        }
    }

    async getMatchInfo() {
        return await cache.getGame().get(this.matchKey);
    }

    async createRoom() {
        const roomKey = this.makeRoomKey(this.roomName);
        const myInfo =  await this.getMyInfo();
        const roomInfoJson = JSON.stringify([myInfo]);
        
        await cache.getGame().mSet([this.matchKey, roomKey, roomKey, roomInfoJson]);
        
        // 레거시 데이터 관리용
        await cache.getGame().expire(roomKey, 60*60); // 1 hour 뒤에 리얼 방폭.

        this.playerInfos = [myInfo];
        this.roomKey = roomKey;
    }

    async joinRoom(roomKey) {
        let roomInfo = await cache.getGame().get(roomKey);
        if (!roomInfo) {
            log.error(`FailedFriendRoomJoin. NoExistRoom:${roomKey}`);
            throw 100005; // 조인할 룸 정보가 없다
        }

        roomInfo = JSON.parse(roomInfo);

        if (roomInfo.length > 2) {
            log.error(`FailedFriendRoomJoin. ExccedRoomMember`);
            throw 100012; // 정원초과
        }

        let found = roomInfo.findIndex((x) => x.user_id === this.userId);
        if (found > -1) {
            log.error(`FailedFriendRoomJoin. SameUser`);
            throw 100006; // 내가 만든 방에 내가 조인 할 수 없다.
        }

        const myInfo = await this.getMyInfo();
        roomInfo.push(myInfo);
        const roomInfoJson = JSON.stringify(roomInfo);
        
        await cache.getGame().set(roomKey, roomInfoJson);

        await cache.getGame().del(this.matchKey);

        this.playerInfos = roomInfo;
        this.roomKey = roomKey;
    }

    async deleteMatch() {
        await cache.getGame().del(this.matchKey);
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

    makeRoomKey(roomName) {
        return `FR:${roomName}${moment.utc().format('x')}${util.sysRangeRand(1,10)}`;
    }

    get matchKey() {
        return `FM:${this.roomName}`;
    }

    get uniqueRoomKey() {
        return this.roomKey;
    }

    get playerList() {
        return this.playerInfos;
    }
}


module.exports = MatchFriendService;