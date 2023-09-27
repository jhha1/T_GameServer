module.exports = {
    select: `SELECT user_id, stage_type, stage_id FROM Stage WHERE user_id = ?;`,
    insert: `INSERT INTO Stage (user_id, stage_type, stage_id) VALUES (?, ? ,?);`,
    update: `UPDATE Stage SET stage_id = ? WHERE user_id = ? AND stage_type = ?;`,
}