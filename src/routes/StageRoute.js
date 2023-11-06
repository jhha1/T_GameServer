const StageController = require('../controllers/StageController');

module.exports.routes = {
    "/RoomInfo": StageController.RoomInfo,
    "/RankInfo": StageController.RankInfo,
    "/RandomMatchPlayStart": StageController.RandomMatchPlayStart,
    "/RandomMatchPlayFinish": StageController.RandomMatchPlayFinish,
    "/FriendPlayStart": StageController.FriendPlayStart,
    "/FriendPlayFinish": StageController.FriendPlayFinish,
    "/ForceRoomQuit": StageController.ForceRoomQuit,
    "/UseItemForChangeShape": StageController.UseItemForChangeShape,
}


