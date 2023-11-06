const AccountService = require('../services/AccountService');
const UserService = require("../services/UserService");
const session = require("../database/session");
const msg = require("../protocol/T_ResProtocol_1");
const { PlatformType } = require("../common/constValues");
const log = require("../utils/logger");

exports.AccountLogin = async (req, res, cb) => {
    const { platform_type, access_token, lang } = req.body;

    try {
        let service = new AccountService(req, platform_type, access_token);

        let platformId = '';
        if (platform_type === PlatformType.Google) {
            platformId = await service.authFirebase();
        } else if (platform_type === PlatformType.Guest) {
            platformId = service.getGuestPlatformId();
        }

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

                await session.init(req, platformId, AccountRow[0], newUser[0]);

                isAccountCreateUser = true;

            } catch (err) {
                log.error(err);
                await service.rollbackAccount(platformId);
                throw 108; // 계정 생성 실패
            }
        }
        AccountRow = AccountRow[0];
        
        // 재 계정로긴에서 세션에 빈값 업어쓰는거 방지
        req.data.save = false;

        return  new msg.AccountLogin(AccountRow, isAccountCreateUser);

    } catch (e) {
        throw e;
    }
}


