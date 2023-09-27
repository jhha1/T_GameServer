global.CONST_TABLES = {};

class ConstService {
    static getConstTableAll() {
        return CONST_TABLES;
    }

    static refleshConstTableAll(constTableList) {
        if (constTableList !== undefined) {
            CONST_TABLES = constTableList;
            return true;
        }
        return false;
    }
}

exports.refleshConstTableAll = function(constTableList) {
    try {
        const result = ConstService.refleshConstTableAll(constTableList);
        return result;
    }
    catch (err) {
        throw err;
    }
}

exports.getConstTableAll = function() {
    try {
        return ConstService.getConstTableAll();
    } catch (err) {
        throw err;
    }
}