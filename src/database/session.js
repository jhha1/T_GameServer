const cache = require('./cache');
const log = require('../utils/logger'); 

async function initSession(req, Account, User) {
    req.session.platformType = Account.platform_type;
    req.session.platformId = Account.platform_id;
    req.session.userId = Account.user_id;
    req.session.shardId = Account.shard_id;
    req.session.deviceType = Account.device_type;
    req.session.lang = Account.lang;
    req.session.isLeave = Account.is_leave;
    req.session.nickname = User.nickname;
    req.session.iconId = User.emote_id;

    await cache.getGame().setEx(getTokenKey(req.session.platformId), 60*60*24, req.sessionID); // session token
}

async function deleteSession(token) {
    await cache.getGame().del(getSessionKey(token));
}

async function checkSameToken(requestedToken, platformId) {
    const token = await cache.getGame().get(getTokenKey(platformId));
    return requestedToken === token;
}

async function deleteToken(platformId) {
    await cache.getGame().del(getTokenKey(platformId));
}

function getSessionKey(token) {
    return `sess:${token}`;
}

function getTokenKey(platformId) {
    return `sessid:${platformId}`;
}

exports.init = initSession;
exports.delete = deleteSession;
exports.checkSameToken = checkSameToken;
exports.deleteToken = deleteToken;
