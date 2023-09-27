const LoginService = require('../services/LoginService');
const msg = require("../protocol/GF_ResProtocol_1");

exports.UserLogin = async (req, res, cb) => {
    try {
        let LoginObject = new LoginService(req);
        
        let result = await LoginObject.getLoginData();

        let MessageObj = new msg.UserLogin(result.User, result.ItemEquip, result.ItemStackable, result.ItemFloatingPoint);

        return MessageObj;

    } catch (err) {
        throw err;
    }
}
