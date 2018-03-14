const blankUnits = [['', '(#|\\*)']];

const pressureUnits = [['2', '(7|8|9)', '\\.', '\\d', '\\d'], ['3', '(0|1)', '\\.', '\\d', '\\d']];
const temperatureUnits = [['0'], ['-?', '[1-9]', '\\d*']]
const rainfallUnits = [['0'], ['-'], ['0', '\\.', '\\d', '\\d'], ['[1-9]', '\\d*', '\\.', '\\d', '\\d']];

function createPartials(unit) {
    const strings = unit.reduce((acc, part, i) => {
        acc.push(acc[i] + part);
        return acc;
    }, ['^\\??']);

    return strings.map(string => new RegExp(string + '$'));
}

function createFull(unit) {
    return new RegExp('^\\??' + unit.join('') + '$');
}

function createPartialPatterns(units) {
    return units.reduce((acc, unit) => acc.concat(createPartials(unit)), []);
}

function createFullPatterns(units) {
    return units.map(createFull);
}

function report(ok) {
    if (ok) {
        return [];
    }
    else {
        return ['Does not match expected pattern'];
    }
}

function validatePartial(patterns, string) {
    const ok = patterns.some(pattern => pattern.test(string));
    return report(ok);
}

function validateFull(patterns, string) {
    if (string === '') {
        return ['Please enter a value'];
    }
    else {
        const ok = patterns.some(pattern => pattern.test(string));
        return report(ok);
    }
}

const blankPartialPatterns = createPartialPatterns(blankUnits);
const blankFullPatterns = createFullPatterns(blankUnits);

function createValidators(units) {
    const partials = createPartialPatterns(units).concat(blankPartialPatterns);
    const fulls = createFullPatterns(units).concat(blankFullPatterns);

    return {
        partial: string => validatePartial(partials, string),
        full: string => validateFull(fulls, string)
    }
}

export const validators = {
    'pressure': createValidators(pressureUnits),
    'temperature': createValidators(temperatureUnits),
    'rainfall': createValidators(rainfallUnits)
}
