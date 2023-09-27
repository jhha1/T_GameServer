const ConstController = require('../controllers/ConstController');

module.exports.routes = {
    "/refleshTables": ConstController.refleshTables,
    "/listTables": ConstController.getTableList,
}


