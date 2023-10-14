module.exports = {
    select: `SELECT seq, platform_type, platform_id, user_id, device_type, is_leave, shard_id, lang FROM Account WHERE platform_type = ? AND platform_id = ?;`,
    insert: `INSERT INTO Account (platform_type, platform_id, user_id, device_type, shard_id, lang) VALUES (?, ?, ?, ?, ?, ?);`,
    delete: `DELETE FROM Account WHERE platform_type = ? AND platform_id = ?;`,
}