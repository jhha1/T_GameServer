const AccountService = require('../services/AccountService');
const UserService = require("../services/UserService");
const session = require("../database/session");
const msg = require("../protocol/T_ResProtocol_1");
const { PlatformType } = require("../common/constValues");
const cache = require("../database/cache");
const log = require("../utils/logger");
const ConstValues = require("../common/constValues");

exports.AccountLogin = async (req, res, cb) => {
    const { platform_type, access_token } = req.body;

    try {
        let service = new AccountService(req, platform_type, access_token);

        let platformId = '';
        if (platform_type === PlatformType.Google) {
            platformId = await service.authGoogle();
        } else if (platform_type === PlatformType.Guest) {
            platformId = service.getGuestPlatformId();
        }

        await lock(); // 동시성 제어를 위한 락

        let isAccountCreateUser = false;
        let AccountRow = await service.getAccount(platformId);
        if (AccountRow.length === 0) {
            // 계정
            const { shardId, newUserId, newAccountQuery } = await service.createAccountQuery(platformId);
            // 유저
            const newUserQuery = new UserService(req).createUser(shardId, newUserId);
            // 한 트랙잭션으로 계정,유저처리.
            AccountRow = await service.createAccountAndUser(shardId, newAccountQuery, newUserQuery);

            isAccountCreateUser = true;
        }
        AccountRow = AccountRow[0];

        await session.init(req, AccountRow);

        await unlock();

        return  new msg.AccountLogin(AccountRow, isAccountCreateUser);

    } catch (e) {
        if (e !== 106) await unlock();
        throw e;
    }

    async function lock() {
        let ret = await cache.getGame().setNX(lockKey(), '1'); // key, value
        if (ret === 0) {
            log.error(`AccountLogin.  (loocked)`);
            throw 106;
        }
        await cache.getGame().expire(lockKey(), ConstValues.Cache.LockTTL);
    }

    async function unlock() {
        await cache.getGame().del(lockKey());
    }

    function lockKey(){
        return `AL:${req.session.user_id}`; // AL: account lock
    }
}


