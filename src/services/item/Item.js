const ItemType = require("../../common/constValues").Item.Type;
const ItemRepository = require("./ItemRepository");

class Item {
    constructor(req) {
        this.req = req;
        this.userId = req.session.userId;
        this.shardId = req.session.shardId;
    }

    static isFloatingPointItem(itemId) {
        return ItemType.FloatingPoint === itemId;
    }

    static isStackableItem(itemId) {
        return ItemType.Stackable < itemId  && itemId < ItemType.Equip;
    }

    static isEquipItem(itemId) {
        return ItemType.Equip < itemId;
    }

    static checkItemType(itemType) {
        switch (itemType) {
            case ItemType.FloatingPoint:
            case ItemType.Stackable:
            case ItemType.Equip:
                return true;
            default:
                return false;
        }
    }
}

module.exports = Item;

