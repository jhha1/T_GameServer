const UserService = require('../services/UserService');
const LoginService = require('../services/LoginService');
const msg = require("../protocol/T_ResProtocol_1");

exports.UserLogin = async (req, res, cb) => {
    try {
        let service = new LoginService(req);
        
        let result = await service.getLoginData();

        return new msg.UserLogin(result.user, result.item_stackable, result.stage);

    } catch (err) {
        throw err;
    }
}

exports.UserChangeNicknameFree = async (req, res, cb) => {
    const { nickname } = req.body;

    try {
        let service = new UserService(req);

        let UserRow = await service.changeNicknameFree( nickname );

        return new msg.UserChangeNicknameFree(UserRow);

    } catch (err) {
        throw err;
    }
}

exports.UserChangeNicknameBuy = async (req, res, cb) => {
    const { nickname } = req.body;

    try {
        let service = new UserService(req);

        let UserRow = await service.changeNicknameBuy( nickname );

        return new msg.UserChangeNicknameBuy(UserRow);

    } catch (err) {
        throw err;
    }
}

exports.UserChangeIconFree = async (req, res, cb) => {
    const { icon_id } = req.body;

    try {
        let service = new UserService(req);

        let UserRow = await service.changeIconFree( icon_id );

        return new msg.UserChangIconFree(UserRow);

    } catch (err) {
        throw err;
    }
}
