import jsTPS_Transaction from "../common/jsTPS.js"

export default class EditItem_Transaction extends jsTPS_Transaction {
    constructor(initStore, index, newText, oldText) {
        super();
        this.store = initStore;
        this.index = index;
        this.newText = newText;
        this.oldText = oldText;
    }

    doTransaction() {
        this.store.editItem(this.index, this.newText);
    }
    
    undoTransaction() {
        this.store.editItem(this.index, this.oldText);
    }
}