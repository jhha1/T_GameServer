const UserModel = require("../model/UserModel");
const ItemEquipModel = require("../model/ItemEquipModel");
const ItemStackableModel = require("../model/ItemStackableModel");
const ItemFloatingPointModel = require("../model/ItemFloatingPointModel");

class UserLogin {
    constructor() {
        this.user = null;
        this.item_equip_list = [];
        this.item_stackable_list = [];
        this.item_floating_point_list = [];
    }

    setUser(obj) {
        let model = new UserModel();
        model.setUserId(obj.user_id);
        model.setNickname(obj.nickname);
        model.setIsLeave(obj.is_leave);
        model.setLastLoginDt(obj.last_login_dt);
        model.setCreatedDt(obj.created_dt);
        this.user = model.get();
    }

    setItemEquip(list) {
        for (let obj of list) {
            let model = new ItemEquipModel();
            model.setItemId(obj.item_id);
            model.setGrade(obj.grade);
            model.setLevel(obj.level);
            model.setPieceCount(obj.piece_count);
            this.item_equip_list.push(model.get());
        }
    }

    setItemStackable(list) {
        for (let obj of list) {
            let model = new ItemStackableModel();
            model.setItemId(obj.item_id);
            model.setCount(obj.count);
            this.item_stackable_list.push(model.get());
        }
    }

    setItemFloatingPoint(list) {
        for (let obj of list) {
            let model = new ItemFloatingPointModel();
            model.setItemId(obj.item_id);
            model.setAmount(obj.amount);
            this.item_floating_point_list.push(model.get());
        }
    }

    get() {
        return {
            user:this.user,
            item_equip:this.item_equip_list,
            item_stackable:this.item_stackable_list,
            item_floating_point:this.item_floating_point_list
        };
    }
}

module.exports = UserLogin;