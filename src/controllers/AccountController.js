const AccountService = require('../services/AccountService');
const UserService = require("../services/UserService");
const session = require("../database/session");
const msg = require("../protocol/T_ResProtocol_1");

exports.AccountLogin = async (req, res, cb) => {
    try {
        let { platform_type, platform_id } = req.body;
        
        let AccountServiceObj = new AccountService(req, platform_type, platform_id);
        
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

        const messageObj = new msg.AccountLogin(AccountRow.platform_type,
            AccountRow.platform_id, AccountRow.user_id, AccountRow.device_type, AccountRow.is_leave);

        return messageObj;

    } catch (err) {
        throw err;
    }
}


