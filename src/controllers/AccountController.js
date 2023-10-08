const AccountService = require('../services/AccountService');
const UserService = require("../services/UserService");
const session = require("../database/session");
const reqMsg = require("../protocol/T_ReqProtocol_1");
const resMsg = require("../protocol/T_ResProtocol_1");

exports.AccountLogin = async (req, res, cb) => {
    try {
        let { platformType, platformId } = new reqMsg.AccountLogin(req.body);

        let AccountServiceObj = new AccountService(req, platformType, platformId);
        
        let AccountRow = await AccountServiceObj.getAccount();
        if (AccountRow.length === 0) {
            // 계정
            const { shardId, newUserId, newAccountQuery } = await AccountServiceObj.createAccountQuery();
            // 유저
            const newUserQuery = new UserService(req).createUser(shardId, newUserId);
            // 한 트랙잭션으로 계정,유저처리.
            AccountRow = await AccountServiceObj.createAccountAndUser(shardId, newAccountQuery, newUserQuery);
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


