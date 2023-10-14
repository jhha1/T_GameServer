const Queries = require('../queries/mapper');
const moment = require("moment");
const ConstTables = require("../const/mapper");
const util = require("../utils/util");
const log = require("../utils/logger");
const db = require("../database/db");

class UserService {

    #UserRow;

    constructor(req) {
        this.req = req;
        this.userId = req.session.userId;
        this.shardId = req.session.shardId;

        this.#UserRow = null;
    }

    isEmpty() {
        return !this.#UserRow;
    }

    async getUser() {
        if (this.isEmpty()) {
            let query = [
                ["UserRow", Queries.User.selectByUserId, [this.userId]]
            ];

            let {UserRow} = await db.select(this.shardId, query);

            this.#UserRow = UserRow[0] ?? [];
        }

        return this.#UserRow;
    }

    async createUser(shardId, userId) {
        const now = moment.utc().format('x');

        let initIconId = util.sysRangeRand(Math.min(...ConstTables.Icon.iconIdList()), Math.max(...ConstTables.Icon.iconIdList())); // icon random.
        let initNickname = ConstTables.KeyValues.get("CharacterInitNickname") || "NoName";
        let initScore = ConstTables.KeyValues.get("CharacterInitScore") || 10000;
        let itemStackableInitData = ConstTables.KeyValues.get("UserCreateItemStackable");
        let itemStackableQueryData = (itemStackableInitData)? itemStackableInitData.flatMap(data => [userId, ...data]) : [];

        // 유저 생성시 같이 생성되어야 할 다른 디비로우도 추가
        // ...

        let curSeason = ConstTables.KeyValues.get('CurrentSeason') || 0;

        let newUserQuery = [
            [Queries.User.insert, [userId, shardId, initIconId, initNickname, now, now]],
            [Queries.Stage.insert, [userId, curSeason, initScore, 0, 0]]
        ];
        if (itemStackableQueryData.length > 0) newUserQuery.push([Queries.ItemStackable.insertMany(itemStackableInitData.length), itemStackableQueryData]);

        await db.execute(shardId, newUserQuery);

        // 유저 생성 확인
        let query = [
            ["newUser", Queries.User.selectByUserId, [userId]]
        ];
        let { newUser } = await db.select(shardId, query);

        return newUser;
    }

    async changeNicknameFree( newNickname ) {
        if (newNickname.length > ConstTables.KeyValues.get('NicknameLengthLimit')) {
            log.error(this.req, `FailedChangeNickname. NicknameLengthLimit. len:${newNickname.length}`);
            throw 100102; // 닉넴 최대 길이 초과
        }

        let UserRow = await this.getUser();
        if (UserRow.nickname_change_cnt >= ConstTables.KeyValues.get('NicknameFreeChangeLimit')) {
            log.error(this.req, `FailedChangeNickname. freeChangeCount_is_over. userChangedCnt:${UserRow.nickname_change_cnt}`);
            throw 100100; // 공짜 닉넴 변경 횟수 초과
        }

        let escapedNickname = db.escape(newNickname);
        UserRow.nickname = escapedNickname;
        UserRow.nickname_change_cnt += 1;

        let query = [
            [Queries.User.updateNickname, [escapedNickname, UserRow.nickname_change_cnt, this.userId]],
        ];

        await db.execute(this.shardId, query);

        req.session.nickname = newNickname; 

        return UserRow;
    }

    async changeNicknameBuy( newNickname ) {
        return await this.getUser();
    }

    async changeIconFree( iconId ) {
        log.info(`id:${iconId}, list:${ConstTables.Icon.iconIdList()}`);

        let found = ConstTables.Icon.iconIdList().findIndex((id) => Number(id) === Number(iconId));
        if (found === -1) {
            log.error(this.req, `FailedChangeIcon. NoExistIcon. iconId:${iconId}`);
            throw 100101; // 존재하지 않는 아이콘으로 변경 불가
        }

        let UserRow = await this.getUser();

        UserRow.emote_id = iconId;

        let query = [
            [Queries.User.updateEmote, [iconId, this.userId]],
        ];

        await db.execute(this.shardId, query);

        req.session.iconId = iconId; 

        return UserRow;
    }
}

module.exports = UserService;