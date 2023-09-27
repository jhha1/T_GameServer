module.exports = {
    select: `SELECT user_id, gacha_type, level, point FROM GachaLevel WHERE user_id = ?;`,
    selectWithGachaId: `SELECT user_id, gacha_type, level, point FROM GachaLevel WHERE user_id = ? AND gacha_type = ?;`,
    insert: `INSERT INTO GachaLevel (user_id, gacha_type, level, point) VALUES (?, ? ,?, ?);`,
    update: `UPDATE GachaLevel SET level = ?, point = ? WHERE user_id = ? AND gacha_type = ?;`,
}
