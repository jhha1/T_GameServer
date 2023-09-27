module.exports = {
    select: `SELECT user_id, item_id, amount FROM ItemDouble WHERE user_id = ?;`,
    insert: `INSERT INTO ItemDouble (user_id, item_id, amount) VALUES (?, ? ,?);`,
    update: `UPDATE ItemDouble SET amount = ? WHERE user_id = ? AND item_id = ?;`,
    insertMany: (rowCount) => {
        let q = `INSERT INTO ItemDouble (user_id, item_id, amount) VALUES `;
        for (let i = 0; i < rowCount; i++) {
            q += `(?, ?, ?),`;
        }
        q = q.slice(0, -1) + ';';
        return q;
    }
}