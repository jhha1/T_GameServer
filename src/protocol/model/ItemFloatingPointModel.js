class ItemFloatingPointModel {
    constructor() {
        this.item_id = 0;
        this.amount = 0;
    }

    setItemId(itemId) {
        this.item_id = itemId;
    }

    setAmount(amount) {
        this.amount = amount;
    }

    get() {
        return [
            this.item_id,
            this.amount,
        ];
    }
}

module.exports = ItemFloatingPointModel;