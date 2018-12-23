import uniqid from 'uniqid';

export default class List {
    constructor() {         // when initialize new list, dont need to pass in
        this.items = [];
    }

    addItem (count, unit, ingredient) {
        const item = {
            id: uniqid(),
            count, 
            unit, 
            ingredient      // need unique ids so that they can be targeted later (uniqid package)
        }
        this.items.push(item);
        return item;
    }

    deleteItem(id) {        // deletes an ingredient
        const index = this.items.findIndex(el => el.id === id);
        // [2, 4, 8] splice(1, 2) -> returns [4, 8], original array is [2]
        // [2, 4, 8] slice(1, 2) -> returns 4, original array is [2, 4, 8]
        this.items.splice(index, 1)
    }

    updateCount(id, newCount) {         // updates the adjusted count on ingredient
        this.items.find(el => el.id === id).count = newCount;
    }
}