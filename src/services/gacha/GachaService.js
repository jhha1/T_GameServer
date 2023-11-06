const ConstTables = require("../../const/mapper");
const ItemService = require("../item/ItemService");
const Item = require("../item/Item");
const log = require("../../utils/logger");
const GachaLevel = require('./GachaLevel');

class GachaService {
    #GradeProbList;
    #GradeProbSum;

    constructor(req, gachaId, gachaCount, isWatchedAd) {
        this.req = req;
        this.userId = req.data.userId;
        this.shardId = req.data.shardId;
        this.gachaId = Number(gachaId);
        this.gachaCount = Number(gachaCount);
        this.isWatchedAd = Number(isWatchedAd) || 0;

        this.picked = [];

        this.GachaType = null;
        this.#GradeProbList = null;
        this.#GradeProbSum = null;

        this.C_Gacha = null;
        this.C_GachaLevel = null;

        this.GachaLevelObject = new GachaLevel(this.req);
        this.GachaService = new GachaService(req);
        this.ItemService = new ItemService(req);
    }

    async check() {
        this.C_Gacha = ConstTables.Gacha.get(this.gachaId);
        if (!this.C_Gacha) {
            log.error(this.req, `FailedExecuteGacha. NoExist_ConstTable[C_Gacha]`);
            throw 99999;
        }

        if (this.gachaCount !== Number(this.C_Gacha.gacha_count_1)
            && this.gachaCount !== Number(this.C_Gacha.gacha_count_2)) {
            log.error(this.req, `FailedExecuteGacha. InvalidGachaCount`);
            throw 99999;
        }

        this.GachaType = this.C_Gacha.gacha_type;

        let userGachaLevel = 1;
        const { haveGachaLevel } = await this.getAll();
        if (haveGachaLevel && haveGachaLevel.length > 0) {
            const row = haveGachaLevel.find((x) => x.gacha_type === this.GachaType);
            if (row.length > 0) userGachaLevel = row.level;
        }

        this.#GradeProbList = ConstTables.GachaProb.get(this.gachaId, userGachaLevel);
        this.#GradeProbSum = ConstTables.GachaProb.getProbSum(this.gachaId, userGachaLevel);
        if (!this.#GradeProbList) {
            console.error(this.req, `Invalid_Gacha_Prob_List. GradeProbList:${this.#GradeProbList}`);
            throw 99999;
        }
        if (!this.#GradeProbSum) {
            console.error(this.req, `Invalid_Gacha_ProbSum. GradeProbSum:${this.#GradeProbSum}`);
            throw 99999;
        }
    }

    calculateCost() {
        if(this.isWatchedAd) return;

        if (!Item.isStackableItem(this.C_Gacha.pay_item_id)) {
            console.error(this.req, `Invalid_Gacha_PayItem. ItemId:${this.C_Gacha.pay_item_id}`);
            throw 99999; // stackable만 소환재화로 가능
        }

        const payItemCount = (this.gachaCount === this.C_Gacha.gacha_count_1)? this.C_Gacha.pay_amount_1 : this.C_Gacha.pay_amount_2;
        const decrItemList = [{id:this.C_Gacha.pay_item_id, count:payItemCount}];

        this.ItemService.decreaseMulti(decrItemList);
    }

    pick(random, candidate) {
        let pickedCount = 0;
        let loopMax = this.gachaCount * 10;

        for (let i = 0; i < loopMax; i++) { // 무한루프 방지

            if (pickedCount >= this.gachaCount) break;

            // 등급 결정
            let grade = this.#pickGrade(random.first);

            // 최종 결정
            let candidates = candidate.getListByGrade(grade);
            let pick = this.#pickItem(random.second, candidates);
            if (!pick) {
                continue;
            }

            this.picked.push(pick);

            pickedCount++;
        }

        if (this.picked.length < this.gachaCount) {
            // 다 못 뽑았을경우.
            console.error(this.req, `InsufficientPickAttempts(${this.picked.length}/${this.gachaCount})`);
            throw 99999; // 예외 던져 재화소진방지. 유저가 재시도 하도록.
        }
    }

    async calculatePoint() {
        await this.GachaLevelObject.calculatePoint(this.gachaId, this.gachaType, this.gachaCount);
    }

    #pickGrade(random) {
        let value = Math.floor(random() * this.#GradeProbSum); // 범위지정랜덤

        let rate_sum = 0;
        for (let row of this.#GradeProbList) { // 등급결정
            if (rate_sum < value && value <= rate_sum + row.prob) {
                return row.grade;
            }
            rate_sum += row.prob;
        }

        if (value === 0) return this.#GradeProbList[0].grade; // 첫번째 인덱스의 grade 리턴
    }

    #pickItem(random, candidates) {
        if (!candidates || candidates.length === 0) {
            console.error(this.req, `NullCandidates`);
            return null; // 이런일이 일어나면 안되므로 에러로깅, 재소환
        }

        let value = Math.floor(random() * candidates.length); // 아이템간 확률은 동일.
        let pick = candidates[value];
        if (!pick) {
            console.error(this.req, `NullPicked. rand:${value}, rand_max:${candidates.length}, candidates:${JSON.stringify(candidates)}`);
            return null;  // 이런일이 일어나면 안되므로 에러로깅, 재소환
        }

        pick.count = 1; // 공통 연산 포맷을 맞추기위해. 1개 뽑았으니 카운트 1개.

        return pick;
    }

    get pickedList() {
        return this.picked;
    }

    async getAll() {
        let results = {
            haveGachaLevel: await this.GachaLevelObject.get()
        };

        return results;
    }

    get getQueries() {
        return this.GachaLevelObject.getQueries;
    }

    async saveCacheOnly() {
        await this.GachaLevelObject.setCacheOnly();
    }

    get UserGachaLevel() {
        return this.GachaLevelObject;
    }
}


module.exports = GachaService;

