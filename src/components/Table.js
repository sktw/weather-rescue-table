import React from 'react';
import PropTypes from 'prop-types';
import * as Validators from '../validators';
import * as Transformers from '../transformers';
import {beginUpdateValue, updateValue, endUpdateValue, copy, copyError} from '../actions';
import {classList, selectInput, COPY_SUPPORTED} from '../utils';
import {TabIndexGenerator} from './componentUtils';
import Icon from './Icon';

/*
 * Bug in Edge causes input not to be selected after focus
 * See https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8229660/
 * However, as described in the comment below, the suggested fix triggers unexpected behavior in Chrome
 * This behavior also occurs in Firefox and Edge
 * https://stackoverflow.com/questions/38487059/selecting-all-content-of-text-input-on-focus-in-microsoft-edge#comment64782060_38489919
 *
 * Select after focus works when focus occurs through keypress, but not through mouse click. 
 *
 * Solution:
 * 1. In value input, handle onClick as well as onFocus, and set selection.
 * 2. In result input, handle onClick (for left click) and onContextMenu (for right click), setting selection in both.
*/

export class ValueInput extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleKeyDown(e) {
        const code = e.keyCode;

        if (code === 13 || code === 40) {
            e.preventDefault();
            this.props.onSwitchInput(this.props.tabIndex, this.props.tabIndex + 1);
        }
        else if (code === 38) {
            e.preventDefault();
            this.props.onSwitchInput(this.props.tabIndex, this.props.tabIndex - 1);
        }
    }

    handleChange(e) {
        const validator = Validators.validators[this.props.valueType];
        const transformer = Transformers.transformers[this.props.valueType];

        let value = e.target.value;
        let unclear = this.props.unclear;

        if (value.indexOf('/') > -1) {
            value = value.replace(/\//g, '');
            unclear = !unclear;
        }

        value = transformer(value);
        const partialErrors = validator.partial(value);
        const fullErrors = validator.full(value);

        this.props.dispatch(updateValue(value, partialErrors, fullErrors, unclear));
    }

    handleFocus(e) {
        selectInput(e.target);
        this.props.dispatch(beginUpdateValue(this.props.col, this.props.row));
    }

    handleBlur(e) {
        if (!this.props.edited) { // ensure at least one change if not edited
            this.handleChange(e);
        }

        this.props.dispatch(endUpdateValue());
    }

    handleClick(e) {
        // see summary at top of page for details of why this is needed
        selectInput(e.target);
    }

    render() {
        const {tabIndex, edited, focused, unclear, value, partialErrors, fullErrors} = this.props;

        const isInvalid = !unclear && edited && ((focused && partialErrors.length > 0) || (!focused && fullErrors.length > 0));
        const isValid = edited && !focused && (unclear || fullErrors.length === 0);

        const className = classList([
            ['input-group value-group', true],
            ['is-invalid', isInvalid],
            ['is-valid', isValid],
            ['is-unclear', !isInvalid && unclear]
        ]);

        let iconName = '';

        if (unclear) {
            iconName = 'wi-cloud';
        }
        else if (isInvalid) {
            iconName = 'wi-rain';
        }
        else {
            iconName = 'wi-day-sunny';
        }

        return (
            <div className={className}>
                <div className="input-group-prepend">
                    <span className="input-group-text value-icon">
                        <Icon iconName={iconName} />
                    </span>
                </div>
                <input 
                    className="form-control value-input"
                    type="text" 
                    value={value} 
                    tabIndex={tabIndex}
                    onKeyDown={this.handleKeyDown} 
                    onChange={this.handleChange} 
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                    onClick={this.handleClick}
                />
                <div className="invalid-tooltip value-tooltip">{partialErrors.join(', ')}</div>
            </div>
        );
    }
}

ValueInput.propTypes = {
    tabIndex: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    row: PropTypes.number.isRequired,
    valueType: PropTypes.oneOf(['pressure', 'temperature', 'rainfall']).isRequired,
    value: PropTypes.string.isRequired,
    fullErrors: PropTypes.arrayOf(PropTypes.string).isRequired,
    partialErrors: PropTypes.arrayOf(PropTypes.string).isRequired,
    unclear: PropTypes.bool.isRequired,
    edited: PropTypes.bool.isRequired,
    focused: PropTypes.bool.isRequired,
    onSwitchInput: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired
};


export class ResultsInput extends React.Component {
    constructor(props) {
        super(props);
        this.handleCopy = this.handleCopy.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleInputClick = this.handleInputClick.bind(this);
        this.handleInputContextMenu = this.handleInputContextMenu.bind(this);
        this.handleInputCopy = this.handleInputCopy.bind(this);
        this.inputRef = null;
    }

    handleCopy(e) {
        e.preventDefault();

        // https://developers.google.com/web/updates/2015/04/cut-and-copy-commands?hl=en

        selectInput(this.inputRef);

        try {
            const success = document.execCommand('copy');

            if (success) {
                this.props.dispatch(copy(this.props.col));
                this.props.onSwitchInput(this.props.tabIndex, this.props.tabIndex + 1);
            }
            else {
                this.props.dispatch(copyError(this.props.col));
            }
        }
        catch (e) {
            this.props.dispatch(copyError(this.props.col));
        }
    }

    handleKeyDown(e) {
        const code = e.keyCode;
        if (code === 13) {
            this.handleCopy(e);
        }
        else if (code === 40) {
            e.preventDefault();
            this.props.onSwitchInput(this.props.tabIndex, this.props.tabIndex + 1);
        }
        else if (code === 38) {
            e.preventDefault();
            this.props.onSwitchInput(this.props.tabIndex, this.props.tabIndex - 1);
        }
    }

    handleInputClick() {
        selectInput(this.inputRef);
    }

    handleInputContextMenu() {
        selectInput(this.inputRef);
    }

    handleInputCopy() {
        if (this.props.value !== '') {
            this.props.dispatch(copy(this.props.col));
        }
    }

    render() {
        const {tabIndex, value, copied, hasCopyError} = this.props;
        const className = classList([
            ['form-control result-input', true],
            ['is-valid', copied],
            ['is-invalid', hasCopyError]
        ]);

        const disabled = (value === '') || !COPY_SUPPORTED;

        return (
            <div className="input-group result-group">
                <input 
                    className={className}
                    type="text" 
                    value={value}
                    tabIndex="-1"
                    ref={input => this.inputRef = input}
                    onCopy={this.handleInputCopy}
                    onClick={this.handleInputClick}
                    onContextMenu={this.handleInputContextMenu}
                />
                <div className="input-group-append">
                    <button 
                        className="btn btn-outline-secondary copy-button" 
                        title="Copy"
                        tabIndex={tabIndex}
                        onClick={this.handleCopy} 
                        onKeyDown={this.handleKeyDown}
                        disabled={disabled}
                    ><Icon iconName="fa-copy" /></button>
                </div>
                <div className="valid-tooltip">Copied</div>
                <div className="invalid-tooltip">Copy error</div>
            </div>
        );
    }
}

ResultsInput.propTypes = {
    tabIndex: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    row: PropTypes.number.isRequired,
    value: PropTypes.string.isRequired,
    copied: PropTypes.bool.isRequired,
    hasCopyError: PropTypes.bool.isRequired,
    onSwitchInput: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired
};

class Table extends React.Component {
    constructor(props) {
        super(props);
    }

    renderValueInput(col, row, tabIndex, attrs) {

        const {onSwitchInput, dispatch, current, table} = this.props;
        let valueProps;

        if (col === current.col && row === current.row) {
            const {value, fullErrors, partialErrors, unclear, edited} = current;
            valueProps = {value, fullErrors, partialErrors, unclear, edited, focused: true};
        }
        else {
            const {value, fullErrors, unclear, edited} = table[col][row];
            valueProps = {value, fullErrors, partialErrors: [], unclear, edited, focused: false};
        }

        return (
            <ValueInput 
                tabIndex={tabIndex} 
                col={col} 
                row={row} 
                valueType={attrs.type} 
                onSwitchInput={onSwitchInput}
                dispatch={dispatch}
                {...valueProps}
            />
        );
    }

    renderResultInput(col, row, tabIndex) {
        const {results, onSwitchInput, dispatch} = this.props;
        const {value, copied, hasCopyError} = results[col];

        return (
            <ResultsInput 
                tabIndex={tabIndex} 
                col={col} 
                row={row} 
                value={value}
                copied={copied}
                hasCopyError={hasCopyError}
                onSwitchInput={onSwitchInput}
                dispatch={dispatch}
            />
        );
    }

    renderColumnHeader(col, attrs) {
        return (
            <th key={col}>
                {attrs.title}
            </th>
        );
    }

    getBlockBoundaries(manifest) {
        const blockBoundaries = {0: true};
        manifest.blocks.reduce((acc, b) => {
            acc += b;
            blockBoundaries[acc] = true;
            return acc
        }, 0);

        return blockBoundaries;
    }

    render() {
        const {manifest} = this.props;
        const columnLength = manifest.locations.length;
        const blockBoundaries = this.getBlockBoundaries(manifest);

        const tabIndexGen = new TabIndexGenerator(manifest);

        const colgroup = (<colgroup>{manifest.columns.map((attrs, j) => {
            if (!attrs.ignore) {
                return <col key={j} className={'column-' + attrs.type} />;
            }
            else {
                return null;
            }
        })}</colgroup>);

        const headerRow = (<tr>{manifest.columns.map((attrs, j) => {
            if (!attrs.ignore) {
                return this.renderColumnHeader(j, attrs);
            }
            else {
                return null;
            }
        })}</tr>);

        const valueRows = manifest.locations.map((name, i) => {
            const className = classList([
                ['above-block-boundary', (i + 1) in blockBoundaries],
                ['below-block-boundary', i in blockBoundaries]
            ]);

            return (
                <tr className={className} key={i}>
                    {manifest.columns.map((attrs, j) => {
                        if (attrs.type === 'header') {
                            return <td className="row-header" key={j}>{name}</td>;
                        }
                        else if (!attrs.ignore) {
                            return <td key={j}>{this.renderValueInput(j, i, tabIndexGen.next(), attrs)}</td>;
                        }
                        else {
                            return null;
                        }
                    
                    })}
                </tr>
            );
        });

        const resultsRow = (<tr className="results-row" key={columnLength}>{manifest.columns.map((attrs, j) => {
            if (attrs.type === 'header') {
                return <td key={j}><strong>Results</strong></td>;
            }
            else if (!attrs.ignore) {
                return <td key={j}>{this.renderResultInput(j, columnLength, tabIndexGen.next())}</td>;
            }
            else {
                return null;
            }
        })}</tr>);

        const rows = valueRows;
        rows.push(resultsRow);

        // workaround since IE11 doesn't respect column widths in fixed layout table with input group in cell
        const width = (10 + tabIndexGen.getValueColumnCount() * 6) + 'rem';
        const style = {width, minWidth: width};

        return (
            <table className="table input-table" style={style}>
                {colgroup}
                <thead>
                    {headerRow}
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        );
    }
}

Table.propTypes = {
    manifest: PropTypes.object.isRequired,
    table: PropTypes.object.isRequired,
    results: PropTypes.object.isRequired,
    current: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    onSwitchInput: PropTypes.func.isRequired
};

export default Table;
