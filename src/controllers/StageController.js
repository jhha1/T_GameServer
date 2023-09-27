const StageService = require('../services/StageService');
const Response = require("../utils/response");
const moment = require("moment/moment");
const log = require("../utils/logger");
const ConstTables = require("../const/mapper");
const ConstValues = require("../common/constValues");

exports.StageClear = async (req, res, cb) => {
    try {
        let obj = new StageClear(req, res);
        
        await obj.clear();

        return obj.result;

    } catch (err) {
        throw err;
    }
}

class StageClear {
    constructor(req, res) {
        this.req = req;
        this.userId = req.session.userId;
        this.shardId = req.session.shardId;
        this.lastStageId = req.session.stageId;
        this.lastGoldAmount = req.session.goldAmount;
        this.lastStageClearDt = req.session.lastStageClearDt;

        this.clearStageId = Number(req.query.stageId);
        this.clearGoldAmount = Number(req.query.goldAmount);
        this.isRepeat = Number(req.query.isRepeat);

        this.C_StageInfo = null;
        this.clearSubStageId = 0;
        this.newGoldAmount = 0;
        this.now = moment.utc().format('x');
        this.warningPoint = 0;

        this.StageService = new StageService(req);
        this.response = new Response(res);
    }

    async clear() {
        try {
            this.#checkStageId();
            this.#checkPlayTime();
            this.#checkGold();

            await this.StageService.updateClear(this.clearStageId, this.newGoldAmount, this.warningPoint);

        } catch (err) {
            throw err;
        }
    }

    #checkStageId() {
        if (this.isRepeat) {
            if (this.lastStageId !== this.clearStageId) {
                log.error(this.req, `InvalidStageId. stage{last:${this.lastStageId},try:${this.clearStageId}}}`);
                throw 999999; // 반복은 스테이지가 동일함
            }
        }
        else {
            if (this.lastStageId + 1 !== this.clearStageId) {
                log.error(this.req, `InvalidStageId. tryStageId:${this.clearStageId}, lastStageId:${this.lastStageId}`);
                throw 999999;
            }
        }
    }

    #checkPlayTime() {
        this.C_StageInfo = ConstTables.Stage.get(this.clearStageId);
        this.clearSubStageId = this.C_StageInfo.subStageId ?? 0;

        if (this.clearSubStageId === ConstValues.Stage.SubStageStart) {
            return; // 첫 스테이지는 체크하지 않는다.
        }

        if (this.now - this.lastStageClearDt < ConstValues.Stage.PlayLimitTime) { // 플레이시간 짧음
            log.error(this.req, `Hack_PlayTime. clearDt:${this.lastStageClearDt - this.now}`);
            this.warningPoint++;
        }
    }

    #checkGold() {
        const goldAmount = (this.C_StageInfo)? this.C_StageInfo.goldAmount : 0;
        const goldBuff_1 = this.req.session.goldBuff_1 || 1;
        const goldBuff_2 = this.req.session.goldBuff_2 || 1;

        // 0.01% 까지 커버가능
        const getGold = Math.floor((goldAmount * 100) + (goldBuff_1 * 100) + (goldBuff_2 * 100) / 100);
        const checkGold = getGold + Math.ceil(getGold / ConstValues.Stage.GoldBufferPercent);
        if (this.clearGoldAmount > checkGold) {
            log.error(this.req, `Hack_Gold. normalGold:${getGold}, tryGold:${this.clearGoldAmount}`);
            this.warningPoint++;
        }

        this.newGoldAmount = this.lastGoldAmount + this.clearGoldAmount;
    }
    get result () {
        this.response.primitives()
            .set("stage_id", this.clearStageId)
            .set("gold_amount", this.newGoldAmount)
            .end();

        return this.response;
    }
}
