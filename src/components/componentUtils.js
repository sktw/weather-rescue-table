export class TabIndexGenerator {
    constructor(manifest) {
        this.manifest = manifest;
        const valueRowCount = manifest.locations.length;
        const valueColumnCount = this.getValueColumnCount();
        let tabIndex;
        this.tabIndices = [];
        this.index = 0;

        // value inputs

        for (let i = 0; i < valueRowCount; i++) {
            for (let j = 0; j < valueColumnCount; j++) {
                tabIndex = 1 + i + j * valueRowCount;
                this.tabIndices.push(tabIndex);
            }
        }

        // result inputs
        
        for (let j = 0; j < valueColumnCount; j++) {
            tabIndex++;
            this.tabIndices.push(tabIndex);
        }

        // done

        this.tabIndices.push(tabIndex + 1);
    }

    getValueColumnCount() {
        return this.manifest.columns.filter(attrs => !attrs.ignore && attrs.type !== 'header').length;
    }

    next() {
        return this.tabIndices[this.index++];
    }

    doneTabIndex() {
        return this.tabIndices[this.tabIndices.length - 1];
    }
}
