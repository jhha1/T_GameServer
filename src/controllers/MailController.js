const MailService = require('../services/MailService');
const msg = require("../protocol/T_ResProtocol_1");

exports.MailList = async (req, res, cb) => {
    try {
        let service = new MailService(req);
        
        let mailList = await service.getMailList();

        return new msg.MailList(mailList);

    } catch (err) {
        throw err;
    }
}
