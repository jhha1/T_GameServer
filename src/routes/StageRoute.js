const StageController = require('../controllers/StageController');

module.exports.routes = {
    "/FriendPlayInfo": StageController.FriendPlayInfo,
    "/FriendPlayStart": StageController.FriendPlayStart,
    "/FriendPlayFinish": StageController.FriendPlayFinish,
}


