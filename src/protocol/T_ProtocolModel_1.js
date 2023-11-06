class User {
  constructor(user) {
     this.user_id = user.user_id;
     this.nickname = user.nickname;
     this.nickname_change_cnt = Number(user.nickname_change_cnt);
     this.emote_id = Number(user.emote_id);
     this.is_leave = Number(user.is_leave);
     this.last_login_dt = Number(user.last_login_dt);
     this.created_dt = Number(user.created_dt);
  }
};

class ItemStackable {
  constructor(item) {
     this.item_id = item.item_id;
     this.count = Number(item.count);
}};

class Stage {
  constructor(stage) {
     this.user_id = stage.user_id;
     this.season = Number(stage.season);
     this.score = Number(stage.score);
     this.win = Number(stage.win);
     this.lose = Number(stage.lose);
}};

class PlayerInfo {
  constructor(info) {
     this.user_id = info.user_id;
     this.ip = info.ip;
     this.nickname = info.nickname;
     this.rank = Number(info.emote_id);
     this.win = Number(info.is_leave);
     this.lose = Number(info.last_login_dt);
     this.result = Number(info.created_dt);
}};

class Mail {
  constructor() {
     this.mail_id = 0;
     this.user_id = '';
     this.mail_type = 0;
     this.subject = '';
     this.text = '';
     this.img_path = '';
     this.reward_list = '';
     this.received_dt = 0;
     this.read_dt = 0;
     this.rewarded_dt = 0;
}};

module.exports = {
  User,
  ItemStackable,
  PlayerInfo,
  Stage,
  Mail,
}
