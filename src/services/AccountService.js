const db = require('../database/db');
const moment = require("moment");
const cluster = require("cluster");
const os = require("os");
const Queries = require('../queries/mapper');
const ConstValues = require("../common/constValues");
const ItemType = require("../common/constValues").Item.Type;
const { DBName } = require('../common/constValues');
const ItemRepository = require("./item/ItemRepository");
const log = require("../utils/logger");

class AccountService {
    #ItemRepositoryObject;
    constructor(req, platformType, platformId) {
        this.req = req;
        this.platformType = Number(platformType);
        this.platformId = platformId;

        this.#ItemRepositoryObject = new ItemRepository(req);
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
            [Queries.Account.insert, [this.platformType, this.platformId, newUserId, ConstValues.DeviceType.aos, shardId]],
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

    async createAccountAndUser(shardId, newAccountQuery, newUserQuery, cacheData) {
        await db.execute(DBName.Auth, newAccountQuery);
        await db.execute(shardId, newUserQuery);

        await this.#ItemRepositoryObject.setAllCacheOnly([
            {type:ItemType.Equip, v:cacheData.itemEquip},
            {type:ItemType.Stackable, v:cacheData.itemStackable},
            {type:ItemType.FloatingPoint, v:cacheData.itemFloatingPoint}
        ]);

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
            case ConstValues.PlatformType.Google:
            case ConstValues.PlatformType.FaceBook:
                break;
            case ConstValues.PlatformType.Guest:
                // ... platformId가 디바이스넘버
                break;
            default :
                log.error(this.req, `UnSupportedPlatformType:${this.platformType}`);
                throw 10001;
        }

        let shardId = await this.getShardId();
        let newUserId = this.#createNewUserId(shardId);
        let newAccountQuery = [
            [Queries.Account.insert, [this.platformType, this.platformId, newUserId, ConstValues.DeviceType.aos, shardId]],
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

/*
CREATE TABLE `User` (
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `shard_id` int NOT NULL,
  `nickname` varchar(52) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `is_leave` int DEFAULT '0',
  `last_login_dt` bigint DEFAULT '0',
  `created_dt` bigint DEFAULT '0',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin

CREATE TABLE `ShardStatus` (
  `shard_id` int NOT NULL COMMENT '게임디비 샤드 갯수에 따라 1부터 id가 시작',
  `user_count` int NOT NULL,
  PRIMARY KEY (`shard_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin

CREATE TABLE `Account` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `platform_type` int NOT NULL COMMENT 'guest:1, google:2, facebook:3',
  `platform_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `device_type` int DEFAULT '0' COMMENT 'aos:1, ios:2',
  `is_leave` int DEFAULT '0' COMMENT 'join:0, leave:1',
  `shard_id` int NOT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `platform_type` (`platform_type`,`platform_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin

CREATE TABLE `Currency` (
  `user_id` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `currency_id` int(11) NOT NULL,
  `amount` double DEFAULT '0',
  PRIMARY KEY (`user_id`, currency_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
*/