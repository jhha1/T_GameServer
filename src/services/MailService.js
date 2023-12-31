const moment = require('moment');
const db = require('../database/db');
const Queries = require('../queries/mapper');
const log = require("../utils/logger");

class MailService {
    constructor(req) {
        this.req = req;
        this.userId = req.data.userId;
        this.shardId = req.data.shardId;
    }

    async getMailList() {
        let queries = [
            ["MailRows", Queries.Mail.selectByUserId, [this.userId]]
        ];

        const { MailRows } = await db.select(this.shardId, queries);

        return MailRows;
    }
}

module.exports = MailService;