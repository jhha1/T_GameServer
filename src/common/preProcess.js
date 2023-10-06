
const session = require('../database/session');
const ErrorCode = require('./errorCode');
const KeyValuesTable = require("../const/KeyValuesTable");
const log = require('../utils/logger');

async function filter(req, res, next) {
    await checkSession(req);

    req.body.season = KeyValuesTable.get('CurrentSeason') || 0;
}

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
}

const except = [
    '/AccountLogin'
];

exports.filter = filter;