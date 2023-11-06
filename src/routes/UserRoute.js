const UserController = require('../controllers/UserController');

module.exports.routes = {
    "/UserLogin": UserController.UserLogin,
    "/UserChangeNicknameFree": UserController.UserChangeNicknameFree,
    "/UserChangeNicknameBuy": UserController.UserChangeNicknameBuy,
    "/UserChangeIconFree": UserController.UserChangeIconFree,
}


