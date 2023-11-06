const redis = require('redis');
const log = require('../utils/logger');
const ConstValues = require("../common/constValues");

const RETRY_COUNT = 10;
const RETRY_INTERVAL_MS = 1000;

let RedisGameClient = null;
let RedisMatchClient = null;

async function connect() {
    try {
        const redisConfigList = CONFIG["redis"]["list"];

        for (let name in redisConfigList) {
            if (name === 'game') {
                await connectGame(redisConfigList[name]);
            }
            else if (name === 'match') {
                await connectMatch(redisConfigList[name]);
            }
        }

    } catch (err) {
        log.error(`${ENV} Redis 연결 안됨`, err);
        throw err;
    }
}

const retryConfig = (config) => {
    config.retry_strategy = (options) => {
      if (options.error && options.error.code === 'ECONNREFUSED') {
        // Redis 서버에 연결할 수 없는 경우 (ECONNREFUSED 오류 발생)
        console.error('Redis server connection refused. Retrying...');
      }
  
      if (options.attempt > RETRY_COUNT) {
        // 최대 n번까지 재시도하고 그 이후로는 더 이상 재시도하지 않음
        console.error('Max retries reached. Redis server is not available.');
        return undefined;
      }
  
      // n초마다 재시도
      return RETRY_INTERVAL_MS;
    }

    return config; 
};

async function connectGame(redisConfig) {
    redisConfig = retryConfig(redisConfig);
    RedisGameClient = redis.createClient(redisConfig);

    // Redis 연결 이벤트 리스너
    RedisGameClient.on('connect', () => {
        log.info('Connected to Game Redis');
    });

    // Redis 연결 끊김 이벤트 리스너
    RedisGameClient.on('error', (error) => {
        log.error('Game Redis connection error:', error.message);
    });

    // redis v4 연결 (비동기)
    RedisGameClient.connect().then(); 

    RedisGameClient = RedisGameClient.v4;
}

async function connectMatch(redisConfig) {
    redisConfig = retryConfig(redisConfig);
    RedisMatchClient = redis.createClient(redisConfig);

    // Redis 연결 이벤트 리스너
    RedisMatchClient.on('connect', () => {
        log.info('Connected to Match Redis');
    });

    // Redis 연결 끊김 이벤트 리스너
    RedisMatchClient.on('error', (error) => {
        log.error('Match Redis connection error:', error.message);
    });

    // redis v4 연결 (비동기)
    RedisMatchClient.connect().then(); 

    RedisMatchClient = RedisMatchClient.v4;
}

async function isExpired(key) {
    let TTL = await RedisGameClient.TTL(key);
    return !TTL || TTL < ConstValues.Cache.RefreshTTL;
}

exports.connect = connect;
exports.isExpired = isExpired;

exports.getGame = () => {
    return RedisGameClient;
};

exports.getMatch = () => {
    return RedisMatchClient;
};

