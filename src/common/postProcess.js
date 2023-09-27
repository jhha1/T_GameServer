
const log = require('../utils/logger'); 

function filter(req, res, next) {
    sessionSave(req);
}

function sessionSave(req) {
    if (req.session) {
        req.session.save(() => {});
    }
}

exports.filter = filter;