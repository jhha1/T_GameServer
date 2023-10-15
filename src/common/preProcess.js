
const session = require('../database/session');
const ErrorCode = require('./errorCode');
const KeyValuesTable = require("../const/KeyValuesTable");
const log = require('../utils/logger');

async function filter(req, res, next) {
    await checkUserData(req);
}

async function checkUserData(req) {
    //
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

/*
async function checkSession(req) {
    //
    let noCheck = except.findIndex((protocolName) => protocolName === req.path) > -1;
    if (noCheck) {
        return;
    }

    if (req.sessionID && req.session.platformId) {
        let isSame = await session.checkSameToken(req.sessionID, req.session.platformId);
        if (!isSame) {
            log.error(`Dulplicated_Login`);

            setTimeout(async () => {
                await session.delete(req.sessionID); // user kick
            }, 3000);

            throw ErrorCode.DUP_LOGIN;
        }
    }
    else {
        log.error(`Faild_Login_Session__No_Token. ${JSON.stringify(req.session)}, path: ${req.path}`);
        throw ErrorCode.SESSION_NO_TOKEN;
    }
}*/

const except = [
    '/AccountLogin'
];

exports.filter = filter;