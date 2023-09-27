module.exports = {
    selectByUserId: `SELECT user_id, shard_id, nickname, is_leave, last_login_dt, created_dt FROM User WHERE user_id = ?;`,
    insert: `INSERT INTO User (user_id, shard_id, last_login_dt, created_dt) VALUES (?, ?, ?, ?);`
}