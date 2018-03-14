let COPY_SUPPORTED = false;

try {
    COPY_SUPPORTED = document.queryCommandSupported('copy');
}
catch (e) {
    COPY_SUPPORTED = false;
}

export {COPY_SUPPORTED};

export function blurTabIndex(tabIndex) {
    const el = document.querySelector("[tabIndex='" + tabIndex + "']");
    if (el) {
        el.blur();
    }
}

export function focusTabIndex(tabIndex) {
    const el = document.querySelector("[tabIndex='" + tabIndex + "']");
    if (el && !el.disabled) {
        el.focus();
    }
}

/*
 * setSelectionRange as well to fix this bug in iOS Safari https://stackoverflow.com/q/3272089
 * 'backward' to return position to start of input
*/

export function selectInput(input) {
    input.select();
    input.setSelectionRange(0, input.value.length, 'backward');
}

// elm-inspired classList
// http://package.elm-lang.org/packages/elm-lang/html/2.0.0/Html-Attributes#classList

export function classList(parts) {
    const classes = parts.reduce((acc, [string, cond]) => {
        if (cond) {
            acc.push(string);
        }
        return acc;
    }, []);

    if (classes.length === 0) {
        return null;
    }
    else {
        return classes.join(' ');
    }
}

export function objectAssign() {
    const target = arguments[0];

    for (let i = 1; i < arguments.length; i++) {
        const source = arguments[i];

        for (let key in source) {
            target[key] = source[key];
        }
    }

    return target;
}

export function filledArray(n, value) {
    // return array of length n filled with value
    let func;

    if (typeof value !== 'function') {
        func = () => value;
    }
    else {
        func = value;
    }

    const array = [];
    for (let i = 0; i < n; i++) {
        array.push(func());
    }

    return array;
}

export function unique(array) {
    // return unique elements in array
    const elems = {}

    return array.filter(elem => {
        if (elems[elem]) {
            return false;
        }
        else {
            elems[elem] = true;
            return true;
        }
    });
}
