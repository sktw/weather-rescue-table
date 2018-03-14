import {filledArray, objectAssign, unique} from '../utils';

function getInitialValueState() {
    return {
        value: '',
        edited: false,
        unclear: false,
        fullErrors: []
    };
}

function getInitialSelectorState(yearChoices) {
    return {
        year: '',
        locations: '',
        columns: '',
        yearChoices,
        locationsChoices: [],
        columnsChoices: [],
    };
}

function getInitialCurrentState() {
    return objectAssign(getInitialValueState(), {col: -1, row: -1, partialErrors: []});
}

function getInitialState() {
    return {
        selector: getInitialSelectorState([]),
        manifests: [],
        manifest: null,
        table: null,
        results: null,
        current: getInitialCurrentState()
    }
}

function getManifest(manifests, subject) {
    return (subject === '') ? null : manifests.filter(attrs => attrs.id === subject)[0];
}

function initTable(manifest) {
    if (manifest === null) {
        return null;
    }

    const columnLength = manifest.locations.length;

    return manifest.columns.reduce((table, attrs, j) => {
        if (!attrs.ignore && attrs.type !== 'header') {
            table[j] = filledArray(columnLength, getInitialValueState());
        }
        return table;
    }, {});
}

function initResults(manifest) {
    if (manifest === null) {
        return null;
    }

    return manifest.columns.reduce((results, attrs, j) => {
        if (!attrs.ignore && attrs.type !== 'header') {
            results[j] = {value: '', copied: false, hasCopyError: false};
        }
        return results;
    }, {});
}

function formatResult(column) {
    return column.map(({value, unclear}) => {
        return unclear ? '[unclear]' + value + '[/unclear]' : value;
    }).join(',');
}

function updateResults(table, results, col) {
    const prevResult = results[col].value;
    const column = table[col];
    const ok = column.every(({edited, unclear, fullErrors}) => {
        return edited && (unclear || fullErrors.length == 0)
    });
    
    const result = !ok ? '' : formatResult(column);
    if (result === prevResult) { // if result hasn't changed don't update state
        return results;
    }
    else {
        return objectAssign({}, results, {[col]: {value: result, copied: false, hasCopyError: false}});
    }
}

function updateSelector(year, locations, columns, selector, manifests) {
    const locationsChoices = unique(manifests.reduce((acc, attrs) => {
        if (attrs.year === year) {
            acc.push(attrs.locationsTitle);
        }
        return acc;
    }, []));
    locationsChoices.sort();

    const columnsChoices = unique(manifests.reduce((acc, attrs) => {
        if (attrs.year === year && attrs.locationsTitle === locations) {
            acc.push(attrs.columnsTitle);
        }
        return acc;
    }, []));
    columnsChoices.sort();

    return objectAssign({}, selector, {year, locations, columns, locationsChoices, columnsChoices});
}

function loadManifests(state, action) {
    const {manifests} = action;

    const yearChoices = unique(manifests.map(attrs => attrs.year));
    const selector = getInitialSelectorState(yearChoices);

    return objectAssign({}, state, {manifests, selector});
}

function selectSubject(state, action) {
    const {year, locations, columns} = action;
    const {manifests} = state;

    const selector = updateSelector(year, locations, columns, state.selector, manifests);

    if (year && locations && columns) {
        const subject = year + ' ' + locations + ' ' + columns;
        const manifest = getManifest(state.manifests, subject);
        const table = initTable(manifest);
        const results = initResults(manifest);
        const current = getInitialCurrentState();

        return objectAssign({}, state, {manifest, table, results, current, selector});
    }
    else {
        return objectAssign(getInitialState(), {manifests, selector});
    }
}

function done(state) {
    const {manifest} = state;
    const table = initTable(manifest);
    const results = initResults(manifest);

    return objectAssign({}, state, {table, results});
}

function copy(state, action) {
    const {col} = action;
    const result = objectAssign({}, state.results[col], {copied: true, hasCopyError: false});
    const results = objectAssign({}, state.results, {[col]: result});

    return objectAssign({}, state, {results});
}

function copyError(state, action) {
    const {col} = action;
    const result = objectAssign({}, state.results[col], {copied: false, hasCopyError: true});
    const results = objectAssign({}, state.results, {[col]: result});

    return objectAssign({}, state, {results});
}

function toggleUnclear(state) {
    const {col, row} = state.current;
    if (col === -1 && row === -1) { // no value focused
        return state;
    }
    else {
        const current = objectAssign({}, state.current, {unclear: !state.current.unclear});
        return objectAssign({}, state, {current});
    }
}

function beginUpdateValue(state, action) {
    const {col, row} = action;
    const {value, fullErrors, edited, unclear} = state.table[col][row];
    const current = objectAssign({}, state.current, {value, fullErrors, partialErrors: fullErrors, unclear, edited, col, row});
    return objectAssign({}, state, {current});
}

function updateValue(state, action) {
    const {value, partialErrors, fullErrors, unclear} = action;
    const current = objectAssign({}, state.current, {value, unclear, partialErrors, fullErrors, edited: true});
    return objectAssign({}, state, {current});
}

function endUpdateValue(state) {
    const {col, row, value, fullErrors, unclear, edited} = state.current;
    const table = objectAssign({}, state.table, {[col]: objectAssign([], state.table[col], {[row]: {value, fullErrors, edited, unclear}})});

    const results = updateResults(table, state.results, col);
    const current = getInitialCurrentState();

    return objectAssign({}, state, {table, results, current});
}

function tableReducer(state = getInitialState(), action) {
    switch (action.type) {
        case 'LOAD_MANIFESTS':
            return loadManifests(state, action);
        case 'SELECT_SUBJECT':
            return selectSubject(state, action);
        case 'BEGIN_UPDATE_VALUE':
            return beginUpdateValue(state, action);
        case 'UPDATE_VALUE':
            return updateValue(state, action);
        case 'END_UPDATE_VALUE':
            return endUpdateValue(state);
        case 'TOGGLE_UNCLEAR':
            return toggleUnclear(state);
        case 'DONE':
            return done(state);
        case 'COPY':
            return copy(state, action);
        case 'COPY_ERROR':
            return copyError(state, action);
        default:
            return state;
    }
}

export default tableReducer;
