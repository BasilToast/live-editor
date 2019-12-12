const diff = require('fast-diff');

class Operation {
    constructor(oldStr, newStr) {
        this.operations = [];
        this.init(oldStr, newStr);
        return this.getOperations();
    }

    init(oldStr, newStr) {
        const diffResult = diff(oldStr, newStr);
        diffResult.forEach(d => {
            switch (d[0]) {
                case diff.EQUAL:
                    this.retain(d[1].length);
                    break;
                case diff.INSERT:
                    this.insert(d[1]);
                    break;
                case diff.DELETE:
                    this.delete(d[1].length);
                    break;
            }
        });
    }

    retain(length) {
        this.operations.push({
            state: 'retain',
            value: length
        });
    }

    insert(str) {
        this.operations.push({
            state: 'insert',
            value: str
        });
    }

    delete(length) {
        this.operations.push({
            state: 'delete',
            value: length
        });
    }

    getOperations() {
        if (!this.operations[0]) this.retain(0);

        if (this.operations[0].state !== 'retain')
            this.operations.unshift({ state: 'retain', value: 0 });
        if (this.operations[this.operations.length - 1].state !== 'retain')
            this.operations.push({ state: 'retain', value: 0 });

        this.operations.push({
            state: 'timestamp',
            value: Date()
        });

        return this.operations;
    }
}

module.exports = { Operation };
