module.exports = {
    selectByUserId: `SELECT user_id, shard_id, nickname, nickname_change_cnt, emote_id, is_leave, last_login_dt, created_dt FROM User WHERE user_id = ?;`,
    insert: `INSERT INTO User (user_id, shard_id, last_login_dt, created_dt) VALUES (?, ?, ?, ?);`,
    updateNickname: `UPDATE User SET nickname = ?, nickname_change_cnt = ? WHERE user_id = ?;`,
    updateEmote: `UPDATE User SET emote_id = ? WHERE user_id = ?;`
}