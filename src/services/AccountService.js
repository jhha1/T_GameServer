const db = require('../database/db');
const moment = require("moment");
const cluster = require("cluster");
const os = require("os");
const Queries = require('../queries/mapper');
const { PlatformType, DeviceType, DBName } = require('../common/constValues');
const log = require("../utils/logger");

class AccountService {
    constructor(req, platformType, platformId) {
        this.req = req;
        this.platformType = Number(platformType);
        this.platformId = platformId;
    }

    get getPlatformType() {
        return this.platformType;
    }

    get getPlatformId() {
        return this.platformId;
    }

    async getAccount() {
        let query = [
            ["AccountRow", Queries.Account.select, [this.platformType, this.platformId]]
        ];

        let { AccountRow } = await db.select(DBName.Auth, query);

        return AccountRow;
    }

    async insertAccount(shardId, newUserId) {
        let executeQuery = [
            [Queries.Account.insert, [this.platformType, this.platformId, newUserId, DeviceType.aos, shardId]],
            [Queries.ShardStatus.increaseUserCount, [shardId]]
        ];

        await db.execute(DBName.Auth, executeQuery);

        let selectQuery = [
            ["NewAccountRow", Queries.Account.select, [this.platformType, this.platformId]],
        ];

        let { NewAccountRow } = await db.select(DBName.Auth, selectQuery);

        if (NewAccountRow.length === 0) {
            log.error(this.req, `FailedCreateNewAccount. platformType:${this.platformType}, platformId:${this.platformId}`);
            throw 10002;
        }

        return NewAccountRow;
    }

    async getShardId() {
        let query = [
            ["ShardStatusRows", Queries.ShardStatus.select, []]
        ];

        let { ShardStatusRows } = await db.select(DBName.Auth, query);

        if (ShardStatusRows.length === 0) {
            log.error(this.req, `FailedCreateNewAccount. ShardStatusDB Empty! platformType:${this.platformType}, platformId:${this.platformId}`);
            throw 10002;
        }

        let minRow = ShardStatusRows.reduce((min, row) => row.user_count < min.user_count ? row : min, ShardStatusRows[0]);
        return minRow.shard_id;
    }

    async createAccountAndUser(shardId, newAccountQuery, newUserQuery) {
        await db.execute(DBName.Auth, newAccountQuery);
        await db.execute(shardId, newUserQuery);

        // 계정 생성 확인
        let selectQuery = [
            ["NewAccountRow", Queries.Account.select, [this.platformType, this.platformId]],
        ];

        let { NewAccountRow } = await db.select(DBName.Auth, selectQuery);
        if (NewAccountRow.length === 0) {
            log.error(this.req, `FailedCreateNewAccount. platformType:${this.platformType}, platformId:${this.platformId}`);
            throw 10002;
        }

        return NewAccountRow;
    }

    async createAccountQuery(){
        switch (this.platformType) {
            case PlatformType.Google:
            case PlatformType.FaceBook:
                break;
            case PlatformType.Guest:
                // ... platformId가 디바이스넘버
                break;
            default :
                log.error(this.req, `UnSupportedPlatformType:${this.platformType}`);
                throw 10001;
        }

        let shardId = await this.getShardId();
        let newUserId = this.#createNewUserId(shardId);
        let newAccountQuery = [
            [Queries.Account.insert, [this.platformType, this.platformId, newUserId, DeviceType.aos, shardId]],
            [Queries.ShardStatus.increaseUserCount, [shardId]]
        ];
        return { shardId, newUserId, newAccountQuery };
    }

    #createNewUserId(dbShardId) {
        let nowTimestamp = moment.utc().format('x');
        let clusterId = cluster.worker.id;
        let serverIp = '127.000.000.001';
        const networkInterfaces = os.networkInterfaces();
        for (let netInterface in networkInterfaces) {
            for (let networkDetail of networkInterfaces[netInterface]) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                if (networkDetail.family === 'IPv4' && !networkDetail.internal) {
                    serverIp = networkDetail.address;
                }
            }
        }
        let segments = serverIp.split('.'); // Split the IP address into segments
        serverIp = segments.slice(2).join('');

        let newUserId = `${dbShardId}${serverIp}${clusterId}${nowTimestamp}`;
        return newUserId;
    }
}

module.exports = AccountService;