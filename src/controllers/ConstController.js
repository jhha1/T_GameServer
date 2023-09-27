const ResponseUtil = require('../utils/response');
const ConstService = require('../services/ConstService');

exports.getTableList = async (req, res, cb) => {
    try {
        let constTableList = ConstService.getConstTableAll();

        return res.json(ResponseUtil.serialize(constTableList));

    } catch (err) {
        return res.status(500).json(err);
    }
}

exports.refleshTables = async (req, res, cb) => {
    try {
        let { new_tables } = req.body;
        let constTableList = ConstService.refleshConstTableAll(new_tables);

        return res.json(ResponseUtil.serialize(constTableList));
    } catch (err) {
        return res.status(500).json(err);
    }
}

