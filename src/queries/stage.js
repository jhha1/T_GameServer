module.exports = {
    selectByUserId: `SELECT user_id, season, score, win, lose FROM Stage WHERE user_id = ?;`,
    selectByUserIdAndSeason: `SELECT user_id, season, score, win, lose FROM Stage WHERE season = ? AND user_id = ?;`,
    insert: `INSERT INTO Stage (user_id, season, score, win, lose ) VALUES (?, ? ,?, ? ,?);`,
    updateWin: `UPDATE Stage SET win = ?, score = ? WHERE user_id = ? AND season = ?;`,
    updateLose: `UPDATE Stage SET lose = ? WHERE user_id = ? AND season = ?;`,
}