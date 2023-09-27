const GachaLevel = require('./GachaLevel');

class GachaService {
    #req;
    #GachaLevelObject;

    constructor(req) {
        this.#req = req;
        this.#GachaLevelObject = new GachaLevel(this.#req);
    }

    async getAll() {
        let results = {
            haveGachaLevel: await this.#GachaLevelObject.get()
        };

        return results;
    }

    async calculatePoint(gachaId, gachaType, gachaCount) {
        await this.#GachaLevelObject.calculatePoint(gachaId, gachaType, gachaCount);
    }

    get getQueries() {
        return this.#GachaLevelObject.getQueries;
    }

    async saveCacheOnly() {
        await this.#GachaLevelObject.setCacheOnly();
    }

    get UserGachaLevel() {
        return this.#GachaLevelObject;
    }
}

module.exports = GachaService;

