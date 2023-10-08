const AccountService = require('../services/AccountService');
const UserService = require("../services/UserService");
const session = require("../database/session");
const reqMsg = require("../protocol/T_ReqProtocol_1");
const resMsg = require("../protocol/T_ResProtocol_1");
const { PlatformType } = require("../common/constValues");

exports.AccountLogin = async (req, res, cb) => {
    try {
        let { platformType, accessToken } = new reqMsg.AccountLogin(req.body);

        let service = new AccountService(req, platformType, accessToken);

        let platformId = '';
        if (platformType === PlatformType.Google) {
            platformId = await service.authGoogle();
        } else if (platformType === PlatformType.Guest) {
            platformId = service.getGuestPlatformId();
        }
        
        let AccountRow = await service.getAccount(platformId);
        if (AccountRow.length === 0) {
            // 계정
            const { shardId, newUserId, newAccountQuery } = await service.createAccountQuery(platformId);
            // 유저
            const newUserQuery = new UserService(req).createUser(shardId, newUserId);
            // 한 트랙잭션으로 계정,유저처리.
            AccountRow = await service.createAccountAndUser(shardId, newAccountQuery, newUserQuery);
        }
        AccountRow = AccountRow[0];

        await session.init(req, AccountRow);

        return  new resMsg.AccountLogin (
            AccountRow.platform_type,
            AccountRow.platform_id,
            AccountRow.user_id,
            AccountRow.device_type,
            AccountRow.is_leave
        );

    } catch (err) {
        throw err;
    }
}


