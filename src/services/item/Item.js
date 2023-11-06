const ItemType = require("../../common/constValues").Item.Type;

class Item {
    constructor(req) {
        this.req = req;
        this.userId = req.data.userId;
        this.shardId = req.data.shardId;
    }

    static isStackableItem(itemId) {
        return ItemType.Stackable < itemId  && itemId < ItemType.Emoji;
    }

    static isEmojiItem(itemId) {
        return ItemType.Emoji < itemId;
    }

    static checkItemType(itemType) {
        switch (itemType) {
            case ItemType.Stackable:
            case ItemType.Emoji:
                return true;
            default:
                return false;
        }
    }
}

module.exports = Item;

