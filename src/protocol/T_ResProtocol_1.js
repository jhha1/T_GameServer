const model = require("./T_ProtocolModel_1");

class AccountLogin {
  constructor(account, isFirst) {
     this.platform_type = account.platform_type;
     this.platform_id = account.platform_id;
     this.user_id = account.user_id;
     this.device_type = account.device_type;
     this.is_leave = account.is_leave;
     this.lang = account.lang;
     this.is_first = isFirst ? 1 : 0;
  }
}

class UserLogin {
  constructor(user, itemStackable, stage) {
     this.user = new model.User(user);
     this.item_stackable = itemStackable.map((item)=> new model.ItemStackable(item));
     this.stage = new model.Stage(stage);
  }
}

class UserChangeNicknameFree {
    constructor(user) {
        this.user = new model.User(user);
    }
}

class UserChangeNicknameBuy {
    constructor(user) {
        this.user = new model.User(user);
    }
}

class UserChangIconFree {
    constructor(user) {
        this.user = new model.User(user);
    }
}

class RoomInfo {
    constructor(roomKey, player_info_list) {
        this.room_key = roomKey;
        this.player_info_list = player_info_list;
    }
}

class RankInfo {
    constructor(season, rank_list, my_rank) {
        this.season = season;
        this.rank_list = rank_list;
        this.my_rank_info = my_rank;
    }
}

class RandomMatchPlayStart {
    constructor(roomKey, player_info_list) {
        this.room_key = roomKey;
        this.player_info_list = player_info_list;
    }
}

class RandomMatchPlayFinish {
    constructor(stage, itemStackable, my_rank) {
        this.my_rank = my_rank || 0;
        this.stage = stage || [];
        this.item_stackable = itemStackable || [];
    }
}

class FriendPlayStart {
  constructor(roomKey, playerInfoList) {
    this.room_key = roomKey;
    this.player_info_list = playerInfoList;
 }
}

class FriendPlayFinish {
  constructor(stage, itemStackable, myRank) {
    this.my_rank = myRank || 0;
    this.stage = stage || [];
    this.item_stackable = itemStackable || [];
 }
}

class UseItemForChangeShape {
    constructor(itemStackable) {
        this.item_stackable = itemStackable || {};
    }
}

class ForceRoomQuit {}

class MailList {
  constructor(mailList) {
    this.mail_list = mailList;
 }
}

module.exports = {
    AccountLogin,
    UserLogin,
    UserChangeNicknameFree,
    UserChangeNicknameBuy,
    UserChangIconFree,
    RoomInfo,
    RankInfo,
    RandomMatchPlayStart,
    RandomMatchPlayFinish,
    FriendPlayStart,
    FriendPlayFinish,
    ForceRoomQuit,
    UseItemForChangeShape,
    MailList,
}
