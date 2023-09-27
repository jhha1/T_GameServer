class ItemStackableModel {
    constructor() {
        this.item_id = 0;
        this.count = 0;
    }

    setItemId(itemId) {
        this.item_id = itemId;
    }

    setCount(count) {
        this.count = count;
    }

    get() {
        return [
            this.item_id,
            this.count,
        ];
    }
}

module.exports = ItemStackableModel;