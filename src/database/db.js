const mysql = require('mysql2/promise');
const log = require("../utils/logger");
const _ = require("lodash");
const ConstValues = require('../common/constValues');

const dbAuthConnectionPool = []; 
const dbGameConnectionPool = [];


/**
 * select
 * @param {String} dbName
 * @param {String} queries [[q1name : q1], [q2name : q2], ... ] 
 * @returns {Promise}
 */
async function select(dbName, queries) {
    if (!dbName || !queries || queries.length === 0) {
        throw `디비조회실패. 매개변수확인. db:${dbName}, queries:${queries}`;
    }

    const promises = queries.map(async (query) => {
        const conn = await getConnection(dbName);
        try {
            const [rows] = await conn.execute(query[1], query[2]);
            return rows;
        } catch (err) {
            throw err;
        } finally {
            if(conn) conn.release();
        }
    });
    
    try {
        const results = await Promise.all(promises);

        let ret = Object.fromEntries(queries.map(q => [q[0], []]));
        if (queries.length === 1) {
            for (let i = 0; i < results.length; i++) {
                ret[queries[0][0]] = results[i];
            }
        } else {
            for (let i = 0; i < results.length; i++) {
                ret[queries[i][0]] = results[i];
            }
        }

        return ret;
    } catch (err) {
        throw err;
    } 
}

/**
 */
async function execute(dbName, queries) {
    if (!dbName || !queries || queries.length === 0) {
        throw `디비질의실패. 매개변수확인. db:${dbName}, queries:${queries}`;
    }

    // 롤백을 위해 커넥션 공유 하나씩 처리
    let conn = null;
    try {
        conn = await getConnection(dbName);
        
        await conn.beginTransaction();
        await Promise.all(queries.map(query => conn.execute(query[0], query[1])));
        await conn.commit();

    } catch (err) {
        if (conn) {
            await conn.rollback();
        }
        let queryString = queries.map(q => `query {${q[0]}}, values {${q[1]}}`).join("\n");
        log.error(`[DB_ERR] ${err.stack}`);
        log.error(`[DB_ERR_QUERY] ${queryString}`);
        throw err;
    } finally {
        if (conn) {
            conn.release();
        }
    }
}

function escape(value) {
    if (typeof value === 'string') {
        return mysql.escape(value);
    }

    return value;
}

async function insertWithReturnUID(dbName, query) {
    if (!dbName || !query || query.length === 0) {
        throw `디비질의실패. 매개변수확인. db:${dbName}, queries:${query}`;
    }

    let conn = null;
    try {
        conn = await getConnection(dbName);
        const [ result ] = conn.execute(query[0], query[1]);
        return result.insertId;
    } catch (err) {
        log.error(`[DB_ERR_QUERY] query {${query[0]}}, values {${query[1]}}`);
        throw err;
    } finally {
        if (conn) {
            conn.release();
        }
    }
}

/**
 * 앱 부팅 시 DB 연결
 */
function connect() {
    _connectMysql();
}

function _connectMysql() {
    try {
        _connectAuth();
        _connectGame();   
        
    } catch (err) {
        log.error(`${ENV} db 연결 안됨`, err);
        throw err;
    }

    function _connectAuth(){
        let _config = Object.assign(CONFIG["rdb"]["list"]["auth"], CONFIG["rdb"]["options"]);
        _config['namedPlaceholders'] = true;
        dbAuthConnectionPool[0] = mysql.createPool(_config);
        log.info(`Auth DB CONNECTED`);
    }

    function _connectGame(){
        const gameDBConfig = CONFIG["rdb"]["list"]["game"];
        const gameDBList = gameDBConfig["hostList"];
        for (let i = 0; i < gameDBList.length; i++) {
            let _config = Object.assign(_.cloneDeep(gameDBConfig), CONFIG["rdb"]["options"]);
            _config.host = gameDBList[i];
            _config.database = `${_config.database}${i+1}`;
            _config['namedPlaceholders'] = true;
            delete _config.hostList;

            dbGameConnectionPool[i+1] = mysql.createPool(_config);
            log.info(`${_config.database} DB CONNECTED`);
        } 
    }
}

async function getConnection(dbName) {
    if (dbName === ConstValues.DBName.Auth) {
        return await dbAuthConnectionPool[0].getConnection();
    } else if (!isNaN(dbName)) { // game
        return await dbGameConnectionPool[dbName].getConnection(); // dbName === shard number
    }
}

exports.connect = connect;
exports.select = select;
exports.execute = execute;
exports.escape = escape;
exports.insertWithReturnUID = insertWithReturnUID;