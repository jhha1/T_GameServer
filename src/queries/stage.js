module.exports = {
    selectByUserId: `SELECT user_id, season, score, win, lose FROM Stage WHERE user_id = ?;`,
    selectByUserIdAndSeason: `SELECT user_id, season, score, win, lose FROM Stage WHERE user_id = ? AND season = ?;`,
    insert: `INSERT INTO Stage (user_id, season, score, win, lose ) VALUES (?, ? ,?, ? ,?);`,
    updateWin: `UPDATE Stage SET win = win + 1, score = ? WHERE user_id = ? AND season = ?;`,
    updateLose: `UPDATE Stage SET lose = lose + 1 WHERE user_id = ? AND season = ?;`,
}