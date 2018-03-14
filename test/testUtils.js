import {objectAssign} from '../src/utils';

export class ImmutableChecker {
    setState(state) {
        this.state = state;
        this.signature = JSON.stringify(state);
    }

    check() {
        return JSON.stringify(this.state) === this.signature;
    }
}

export function createEvent(attrs) {
    return objectAssign({preventDefault: () => {}}, attrs);
}
