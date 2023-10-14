const db = require('../database/db');
const moment = require("moment");
const cluster = require("cluster");
const os = require("os");
const GoogleOAuth = require('../database/google/googleOAuth');
const Queries = require('../queries/mapper');
const util = require('../utils/util');
const { PlatformType, DeviceType, DBName } = require('../common/constValues');
const log = require("../utils/logger");

class AccountService {
    constructor(req, platformType, accessToken) {
        this.req = req;
        this.platformType = Number(platformType);
        this.accessToken = accessToken;
        this.platformId = null;
    }

    get getPlatformType() {
        return this.platformType;
    }

    get getPlatformId() {
        return this.platformId;
    }

    async authGoogle() {
        try {
            const userId = await GoogleOAuth.auth(this.accessToken);
            return`g2${userId}`;
        } catch (e) {
            log.error(this.req, `액세스 토큰 검증 오류: ${e.message}`);
            throw 107;
        }
    }
    
    getGuestPlatformId() {
        return this.accessToken; // guest는 token에 고유id를 보낸다
    }

    createGuestId() {
        let dt = moment.utc().format('x');
        let rand = util.sysRangeRand(10, 99);
        this.platformId = `g1${dt}${rand}`;
    }

    async getAccount(platformId) {
        let query = [
            ["AccountRow", Queries.Account.select, [this.platformType, platformId]]
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

    async createAccount(platformId, lang){
        switch (this.platformType) {
            case PlatformType.Google:
                break;
            case PlatformType.Guest:
                break;
            default :
                log.error(this.req, `UnSupportedPlatformType:${this.platformType}`);
                throw 10001;
        }

        // 계정 생성 
        let shardId = await this.getShardId();
        let newUserId = this.#createNewUserId(shardId);
        let newAccountQuery = [
            [Queries.Account.insert, [this.platformType, platformId, newUserId, DeviceType.aos, shardId, lang]],
            [Queries.ShardStatus.increaseUserCount, [shardId]]
        ];

        this.platformId = platformId; // todo

        await db.execute(DBName.Auth, newAccountQuery);

        // 계정 생성 확인
        let selectQuery = [
            ["NewAccountRow", Queries.Account.select, [this.platformType, this.platformId]],
        ];

        let { NewAccountRow } = await db.select(DBName.Auth, selectQuery);
        if (NewAccountRow.length === 0) {
            log.error(this.req, `FailedCreateNewAccount. platformType:${this.platformType}, platformId:${this.platformId}`);
            throw 10002;
        }

        return { shardId, newUserId, NewAccountRow };
    }

    async rollbackAccount(platformId) {
        let query = [
            [Queries.Account.delete, [this.platformType, platformId]]
        ];

        await db.execute(DBName.Auth, query);
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