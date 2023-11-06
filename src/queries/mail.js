module.exports = {
    selectByUserId: `SELECT mail_id, user_id, mail_type, lang, subject, text, img_path, reward_list, received_dt, read_dt, rewarded_dt FROM Mail WHERE user_id = ? ORDER BY mail_id DESC LIMIT 30;`,
    insert: `INSERT INTO Mail (user_id, mail_type, lang, subject, text, img_path, reward_list, received_dt, read_dt, rewarded_dt) VALUES (?, ? ,?, ? ,? ,? ,? ,?, ?, ?);`,
    updateRewardedDt: `UPDATE Mail SET rewarded_dt = ? WHERE mail_id = ?;`
}