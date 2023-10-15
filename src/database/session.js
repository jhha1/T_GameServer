const cache = require('./cache');
const log = require('../utils/logger'); 

async function init(req, platformId, Account, User) {
    req.data = {};
    req.data.platformType = Account.platform_type;
    req.data.platformId = Account.platform_id;
    req.data.userId = Account.user_id;
    req.data.shardId = Account.shard_id;
    req.data.deviceType = Account.device_type;
    req.data.lang = Account.lang;
    req.data.isLeave = Account.is_leave;
    req.data.nickname = User.nickname;
    req.data.iconId = User.emote_id;

    await cache.getGame().set(getKey(platformId), JSON.stringify(req.data));
}

async function get(platformId) {
    const data = await cache.getGame().get(getKey(platformId));
    if (data) {
        return JSON.parse(data);
    } 
    return {};
}

async function update(req) {
    if (!req.data.save) return;

    await cache.getGame().set(getKey(req.data.platformId), JSON.stringify(req.data));
}


function getKey(platformId) {
    return `udata:${platformId}`;
}

/*
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

function getSessionKey(token) {
    return `sess:${token}`;
}

async function checkSameToken(requestedToken, platformId) {
    const token = await cache.getGame().get(getTokenKey(platformId));
    return requestedToken === token;
}

async function deleteToken(platformId) {
    await cache.getGame().del(getTokenKey(platformId));
}


function getTokenKey(platformId) {
    return `sessid:${platformId}`;
}
*/

exports.init = init;
exports.get = get;
exports.update = update;
