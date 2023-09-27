class ItemEquip {
    constructor() {
        this.item_id = 0;
        this.grade = 0;
        this.level = 0;
        this.piece_count = 0;
    }

    setItemId(itemId) {
        this.item_id = itemId;
    }

    setGrade(grade) {
        this.grade = grade;
    }

    setLevel(level) {
        this.level = level;
    }

    setPieceCount(pieceCount) {
        this.piece_count = pieceCount;
    }

    get() {
        return [
            this.item_id,
            this.grade,
            this.level,
            this.piece_count
        ];
    }
}

module.exports = ItemEquip;