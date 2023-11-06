
const session = require('../database/session');
const KeyValuesTable = require("../const/KeyValuesTable");
const log = require('../utils/logger');

async function filter(req, res, next) {
    await checkUserData(req);
}

async function checkUserData(req) {
    req.data = {};

    let noCheck = except.findIndex((protocolName) => protocolName === req.path) > -1;
    if (noCheck) {
        return;
    }

    let platformId = req.headers['UID'];
    if (!platformId) {
        platformId = req.headers['uid'];
        if (!platformId) {
            log.error(`Faild_Login. No_UID. path: ${req.path}`);
            throw 101;
        }
    }

    req.data = await session.get(platformId);
    if (!req.data.userId) {
        log.error(`Faild_Login. No_DATA. ${JSON.stringify(req.data)}, path: ${req.path}`);
        throw 101;
    }

    req.data.season = KeyValuesTable.get('CurrentSeason') || 0;
    req.data.save = true; // 세션저장수락
}

const except = [
    '/AccountLogin'
];

exports.filter = filter;