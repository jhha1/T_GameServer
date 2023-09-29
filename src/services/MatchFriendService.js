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
        return await cache.getMatch().get(this.matchKey);
    }

    async createRoom() {
        const roomKey = this.makeRoomKey(this.roomName);
        const myInfo =  await this.getMyInfo();
        const roomDataJson = JSON.stringify([myInfo]);
        
        await cache.getMatch().mSet([this.matchKey, roomKey, roomKey, roomDataJson]);

        this.playerInfos = [myInfo];
        this.roomKey = roomKey;
    }

    async joinRoom(roomKey) {
        let roomData = await cache.getMatch().get(roomKey);
        if (!roomData) {
            log.error(`FailedFriendRoomJoin. NoExistRoom:${roomKey}`);
            throw 100005; // 조인할 룸 정보가 없다
        }

        roomData = JSON.parse(roomData);
        if (roomData.user_id === this.userId) {
            log.error(`FailedFriendRoomJoin. SameUser`);
            throw 100006; // 내가 만든 방에 내가 조인 할 수 없다.
        }

        const myInfo = await this.getMyInfo();
        roomData.push(myInfo);
        const roomDataJson = JSON.stringify(roomData);
        
        await cache.getMatch().set(roomKey, roomDataJson);

        await cache.getMatch().del(this.matchKey);

        this.playerInfos = roomData;
        this.roomKey = roomKey;
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

        return {user_id: UserRow[0].user_id, ip: this.myIP, nickname: "no Name", emote_id: UserRow[0].emote_id, rank: myRank, win: StageRow[0].win, lose: StageRow[0].lose};
    }

    makeRoomKey(roomName) {
        return `FR:${roomName}${moment.utc().format('x')}${util.sysRangeRand(1,10)}`;
    }

    get matchKey() {
        return `FM:${this.roomName}`;
    }

    get result() {
        return {room_key:this.roomKey, palyer_info_list:this.playerInfos};
    }
}


module.exports = MatchFriendService;