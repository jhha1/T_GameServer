module.exports = {
    select: `SELECT shard_id, user_count FROM ShardStatus;`, 
    insert: `INSERT INTO ShardStatus (shard_id, user_count) VALUES (? ,?);`,
    increaseUserCount: `UPDATE ShardStatus SET user_count = user_count + 1 WHERE shard_id = ?;`,
}