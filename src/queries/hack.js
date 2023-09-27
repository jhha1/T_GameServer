module.exports = {
    select: `SELECT user_id, warningPoint FROM Hack WHERE user_id = ?;`,
    insertOrUpdate: `INSERT INTO Hack (user_id, warningPoint) VALUES (?, ? ,?) ON DUPLICATE KEY UPDATE warningPoint = ?;`,
}