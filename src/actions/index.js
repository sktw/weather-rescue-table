export function loadManifests(manifests) {
    return {
        type: 'LOAD_MANIFESTS',
        manifests
    };
}

export function selectSubject(year, locations, columns) {
    return {
        type: 'SELECT_SUBJECT',
        year,
        locations, 
        columns
    };
}

export function beginUpdateValue(col, row) {
    return {
        type: 'BEGIN_UPDATE_VALUE',
        col,
        row
    };
}

export function updateValue(value, partialErrors, fullErrors, unclear) {
    return {
        type: 'UPDATE_VALUE',
        value,
        partialErrors,
        fullErrors,
        unclear
    };
}

export function endUpdateValue() {
    return {
        type: 'END_UPDATE_VALUE',
    };
}

export function done() {
    return {
        type: 'DONE'
    };
}

export function copy(col) {
    return {
        type: 'COPY',
        col
    };
}

export function copyError(col) {
    return {
        type: 'COPY_ERROR',
        col
    };
}

export function toggleUnclear() {
    return {
        type: 'TOGGLE_UNCLEAR'
    };
}
