const GachaService = require('./GachaService');
const Response = require("../../utils/response");
const ConstTables = require("../../const/mapper");
const GachaService = require("../GachaService");
const util = require("../../utils/util");
const db = require("../../database/db");

class ItemGachaService extends GachaService {
    constructor(req, res) {
        super(req, req.body.gachaId, req.body.gachaCount, req.body.isWatchedAd);

        this.response = new Response(res);
    }

    async execute() {
        await super.check();
        await this.#fetch();
        super.calculateCost();
        super.pick(this.#randomModule, this.#candidateModule);
        await super.calculatePoint();
        this.#calculateReward();
        await this.#save();
        this.#log();
    }

    async #fetch() {
        await this.ItemService.getAll();
    }

    #calculateReward() {
        this.ItemService.increaseMulti(super.pickedList);
    }

    async #save() {
        let queries = [
            ...this.ItemService.getQueries,
            ...this.GachaService.getQueries
        ];

        if (queries.length > 0) {
            await db.execute(this.shardId, queries);
        }
    }

    #log() {
        // ...
    }

    get #candidateModule() {
        return ConstTables.ItemEquip;
    }

    get #randomModule() {
        return {
            first: util.Random.GachaGradeItemEquip.quick,
            second : util.Random.GachaItemEquip.quick
        };
    }

    get result() {
        return this.response;
    }
}

module.exports = ItemGachaService;

