const LoginService = require('../services/LoginService');
const resMsg = require("../protocol/T_ResProtocol_1");

exports.UserLogin = async (req, res, cb) => {
    try {
        let LoginObject = new LoginService(req);
        
        let result = await LoginObject.getLoginData();

        return new resMsg.UserLogin(result.user, result.item_stackable, result.stage);

    } catch (err) {
        throw err;
    }
}
