const MatchFriendService = require('../services/MatchFriendService');
const MatchRandomService = require('../services/MatchRandomService');
const StageService = require('../services/StageService');
const reqMsg = require("../protocol/T_ReqProtocol_1");
const resMsg = require("../protocol/T_ResProtocol_1");
const cache = require('../database/cache');
const log = require("../utils/logger");

exports.RoomInfo = async (req, res, cb) => {
    const query = req.body;

    try {
        let { roomKey } = new reqMsg.RoomInfo(query[0]);

        const service = new StageService(req);

        const roomInfo = await service.getRoomInfo(roomKey) || [];

        return new resMsg.RoomInfo(roomKey, roomInfo);

    } catch (e) {
        throw e;
    }
}

exports.RandomMatchPlayStart = async (req, res, cb) => {
    const myIp = req.body.my_ip;

    try {
        const service = new MatchRandomService(req, myIp);

        await service.matching();

        return new resMsg.RandomMatchPlayStart(service.uniqueRoomKey, service.playerList);

    } catch (e) {
        throw e;
    }
}

exports.RandomMatchPlayFinish = async (req, res, cb) => {
    const roomKey = req.body.room_key;
    const isWin = req.body.is_win;

    try {
        const service = new StageService(req);

        await lock(); // 동시성 제어를 위한 락

        await service.finish(roomKey, isWin);

        await unlock();

        return new resMsg.RandomMatchPlayFinish(service.stageInfo, service.itemStackableInfo, await service.rankInfo());

    } catch (e) {
        if (e !== 106) await unlock();
        throw e;
    }

    async function lock() {
        let ret = await cache.getGame().setEx(lockKey(), 60, '1'); // key, value
        if (ret === 0) {
            log.error(`RandomMatchPlayFinish.  (loocked)`);
            throw 106;
        }
        await cache.getGame().expire(lockKey(), 60);
    }

    async function unlock() {
        await cache.getGame().del(lockKey());
    }

    function lockKey(){
        return `RFL:${req.session.user_id}`; // RFL : random finish lock
    }
}

exports.FriendPlayStart = async (req, res, cb) => {
    const roomName = req.body.room_name;
    const myIp = req.body.my_ip;

    try {
        const service = new MatchFriendService(req, roomName, myIp);

        service.checkRoomName(); 

        await lock(); // 동시성 제어를 위한 락

        const roomKey = await service.getMatchInfo();
        if (roomKey) {
            await service.joinRoom(roomKey);
        } 
        else {
            await service.createRoom();
        }

        await unlock(); 

        return new resMsg.FriendPlayStart(service.uniqueRoomKey, service.playerList);

    } catch (e) {
        // 방이름 체크 & 락 예외를 제외한 모든 예외는 락키를 푼다.
        // 방이름 체크는 락키을 걸기전에 일어나고, 이상한 방이름이면 캐싱키에 쓰면 안된다.
        if (e !== 100001 && e !== 100002 && e !== 100003) {
            await unlock(); 
        }
        throw e;
    }

    async function lock() {
        let a = lockKey();
        let ret = await cache.getGame().setEx(lockKey(), 60, '1'); // key, value
        if (ret === 0) {
            log.error(`FailedCreateFriendRoom. room is busy..(loocked)`);
            throw 100003; // 룸 생성중 or 조인중
        }
        await cache.getGame().expire(lockKey(), 60);
    }

    async function unlock() {
        await cache.getGame().del(lockKey());
    }

    function lockKey(){
        return `FL:${roomName}`; // FL: friend lock
    }
}

exports.FriendPlayFinish = async (req, res, cb) => {
    const roomKey = req.body.room_key;
    const isWin = req.body.is_win;

    try {
        const service = new StageService(req);

        await lock(); // 동시성 제어를 위한 락

        await service.finish(roomKey, isWin);

        await unlock(); 

        return new resMsg.FriendPlayFinish(service.stageInfo, service.itemStackableInfo, await service.rankInfo());

    } catch (e) {
        if (e !== 106) await unlock();
        throw e;
    }

    async function lock() {
        let ret = await cache.getGame().setEx(lockKey(), 60, '1'); // key, value
        if (ret === 0) {
            log.error(`FailedFriendPlayFinish.  (loocked)`);
            throw 106; 
        }
        await cache.getGame().expire(lockKey(), 60);
    }

    async function unlock() {
        await cache.getGame().del(lockKey());
    }

    function lockKey(){
        return `FFL:${req.session.user_id}`; // FFL: friend finish lock
    }
}

exports.ForcePlayOut = async (req, res, cb) => {
    const roomKey = req.body.room_key;

    try {

    } catch (e) {
        throw e;
    }
}
