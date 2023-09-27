module.exports = {
    select: `SELECT user_id, kind, id FROM Equip WHERE user_id = ?;`,
    insert: `INSERT INTO Equip (user_id, kind, id) VALUES (?, ? ,?);`,
    update: `UPDATE Equip SET id = ? WHERE user_id = ? AND kind = ?;`,
    insertMany: (rowCount) => {
        let q = `INSERT INTO Equip (user_id, kind, id) VALUES `;
        for (let i = 0; i < rowCount; i++) {
            q += `(?, ?, ?),`;
        }
        q = q.slice(0, -1) + ';';
        return q;
    }
}
