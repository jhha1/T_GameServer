const MatchFriendService = require('../services/MatchFriendService');
const MatchRandomService = require('../services/MatchRandomService');
const StageService = require('../services/StageService');
const ConstValues = require('../common/constValues');
const msg = require("../protocol/T_ResProtocol_1");
const cache = require('../database/cache');
const log = require("../utils/logger");

exports.RoomInfo = async (req, res, cb) => {
    const { room_key } = req.body;

    try {
        const service = new StageService(req);

        const roomInfo = await service.getRoomInfo(room_key) || [];

        return new msg.RoomInfo(room_key, roomInfo);

    } catch (e) {
        throw e;
    }
}

exports.RandomMatchPlayStart = async (req, res, cb) => {
    const { my_ip } = req.body;

    try {
        const service = new MatchRandomService(req, my_ip);

        await service.matching();

        return new msg.RandomMatchPlayStart(service.uniqueRoomKey, service.playerList);

    } catch (e) {
        throw e;
    }
}

exports.RandomMatchPlayFinish = async (req, res, cb) => {
    const { room_key, is_win } = req.body;

    try {
        const service = new StageService(req);

        await lock(); // 동시성 제어를 위한 락

        await service.finish(room_key, is_win);

        await unlock();

        return new msg.RandomMatchPlayFinish(service.stageInfo, service.itemStackableInfo, await service.rankInfo());

    } catch (e) {
        if (e !== 106) await unlock();
        throw e;
    }

    async function lock() {
        let ret = await cache.getGame().setNX(lockKey(), '1'); // key, value
        if (ret === 0) {
            log.error(`RandomMatchPlayFinish.  (loocked)`);
            throw 106;
        }
        await cache.getGame().expire(lockKey(), ConstValues.Cache.LockTTL);
    }

    async function unlock() {
        await cache.getGame().del(lockKey());
    }

    function lockKey(){
        return `RFL:${req.session.user_id}`; // RFL : random finish lock
    }
}

exports.FriendPlayStart = async (req, res, cb) => {
    const { room_name, my_ip } = req.body;

    try {
        const service = new MatchFriendService(req, room_name, my_ip);

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

        return new msg.FriendPlayStart(service.uniqueRoomKey, service.playerList);

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
        let ret = await cache.getGame().setNX(lockKey(), '1'); // key, value
        if (ret === 0) {
            log.error(`FailedCreateFriendRoom. room is busy..(loocked)`);
            throw 100003; // 룸 생성중 or 조인중
        }
        await cache.getGame().expire(lockKey(), ConstValues.Cache.LockTTL);
    }

    async function unlock() {
        await cache.getGame().del(lockKey());
    }

    function lockKey(){
        return `FL:${room_name}`; // FL: friend lock
    }
}

exports.FriendPlayFinish = async (req, res, cb) => {
    const { room_key, is_win } = req.body;

    try {
        const service = new StageService(req);

        await lock(); // 동시성 제어를 위한 락

        await service.finish(room_key, is_win);

        await unlock(); 

        return new msg.FriendPlayFinish(service.stageInfo, service.itemStackableInfo, await service.rankInfo());

    } catch (e) {
        if (e !== 106) await unlock();
        throw e;
    }

    async function lock() {
        let ret = await cache.getGame().setNX(lockKey(), '1'); // key, value
        if (ret === 0) {
            log.error(`FailedFriendPlayFinish.  (loocked)`);
            throw 106; 
        }
        await cache.getGame().expire(lockKey(), ConstValues.Cache.LockTTL);
    }

    async function unlock() {
        await cache.getGame().del(lockKey());
    }

    function lockKey(){
        return `FFL:${req.session.user_id}`; // FFL: friend finish lock
    }
}

exports.ForceRoomQuit = async (req, res, cb) => {
    const { type, room_name } = req.body;
    try {
        if (type === ConstValues.Stage.Type.Friend) {
            const service = new MatchFriendService(req, room_name, '');
            await service.deleteMatch();
        }
        else if (type === ConstValues.Stage.Type.Random) {
            const service = new MatchRandomService(req, '');
            await service.deleteMeFromWaitingQueue();
        }
        return new msg.ForceRoomQuit();

    } catch (e) {
        throw e;
    }
}
