module.exports = {
    select: `SELECT user_id, item_id, grade, level, piece_count FROM ItemEquip WHERE user_id = ?;`,
    insert: `INSERT INTO ItemEquip (user_id, item_id, grade, level, piece_count) VALUES (?, ? ,?, ? ,?);`,
    update: `UPDATE ItemEquip SET level = ?, piece_count = ? WHERE user_id = ? AND item_id = ?;`,
    insertMany: (rowCount) => {
        let q = `INSERT INTO ItemEquip (user_id, item_id, grade, level, piece_count) VALUES `;
        for (let i = 0; i < rowCount; i++) {
            q += `(?, ? ,? ,?, ?),`;
        }
        q = q.slice(0, -1) + ';';
        return q;
    }
}