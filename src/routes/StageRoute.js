const StageController = require('../controllers/StageController');

module.exports.routes = {
    "/FriendPlayStart": StageController.FriendPlayStart,
    "/FriendPlayFinish": StageController.FriendPlayFinish,
}


