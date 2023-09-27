const db = require('../../database/db');
const Queries = require('../../queries/mapper');
const log = require("../../utils/logger");

class UserRepository {
    constructor(req) {
        this.req = req;
        this.userId = req.session.userId;
        this.shardId = req.session.shardId;
    }

    async getUser() {
        let query = [
            ["UserRow", Queries.User.selectByUserId, [this.userId]]
        ];

        let { UserRow } = await db.select(this.shardId, query);

        return UserRow[0] ?? [];
    }
}

module.exports = UserRepository;