const MatchFriendService = require('../services/MatchFriendService');
const StageService = require('../services/StageService');
const cache = require('../database/cache');
const log = require("../utils/logger");

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

        return service.result;

    } catch (e) {
        // 방이름 체크예외를 제외한 모든 예외는 락키를 푼다.
        // 방이름 체크는 락키을 걸기전에 일어나고, 이상한 방이름이면 캐싱키에 쓰면 안된다.
        if (e !== 100001 && e !== 100002) {
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
        return `FL:${roomName}`;
    }
}

exports.FriendPlayFinish = async (req, res, cb) => {
    const roomKey = req.body.room_key;
    const isWin = req.body.is_win;

    try {
        const service = new StageService(req, roomKey, isWin);

        await lock(); // 동시성 제어를 위한 락

        await service.FriendPlayFinish();

        const result = await service.result();

        await unlock(); 

        return result;

    } catch (e) {
        await unlock(); 
        throw e;
    }

    async function lock() {
        let a = lockKey();
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
        return `FFL:${req.session.user_id}`;
    }
}
