const AccountService = require('../services/AccountService');
const UserService = require("../services/UserService");
const session = require("../database/session");
const msg = require("../protocol/T_ResProtocol_1");
const { PlatformType } = require("../common/constValues");
const cache = require("../database/cache");
const log = require("../utils/logger");
const ConstValues = require("../common/constValues");

exports.AccountLogin = async (req, res, cb) => {
    const { platform_type, access_token, lang } = req.body;

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
            const { shardId, newUserId, NewAccountRow } = await service.createAccount(platformId, lang);

            AccountRow = NewAccountRow;

            // 유저
            try {
                const userService = new UserService(req);
                const newUser = await userService.createUser(shardId, newUserId);

                await session.init(req, AccountRow[0], newUser[0]);

                isAccountCreateUser = true;

            } catch (err) {
                log.error(err);
                await service.rollbackAccount(platformId);
                throw 108; // 계정 생성 실패
            }
        }
        AccountRow = AccountRow[0];

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


