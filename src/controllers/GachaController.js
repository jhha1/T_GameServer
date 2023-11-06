const ItemGachaService = require("../services/gacha/ItemGachaService");

exports.GachaItem = async (req, res, cb) => {

    try {
        let obj = new ItemGachaService(req, res);
        
        await obj.execute();

        return obj.result;

    } catch (err) {
        throw err;
    }
}