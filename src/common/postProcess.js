
const log = require('../utils/logger'); 
const session = require('../database/session'); 

async function filter(req, res, next) {
    await session.update(req);
}

/*
function sessionSave(req) {
    if (req.session) {
        req.session.save(() => {});
    }
}*/

exports.filter = filter;