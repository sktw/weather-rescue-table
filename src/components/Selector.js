import React from 'react';
import PropTypes from 'prop-types';
import {selectSubject} from '../actions';

function getOptionsIndex(selected, choices) {
    let selectedIndex = -1;
    const options = [['', 0]];

    choices.forEach((name, index) => {
        if (name === selected) {
            selectedIndex = index + 1;
        }
        options.push([name, index + 1]);
    });

    return [selectedIndex, options];
}

class Selector extends React.Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps) {
        return (nextProps.selector !== this.props.selector);
    }

    render() {
        const {selector, dispatch, onSwitchInput} = this.props;
        const {year, locations, columns, yearChoices, locationsChoices, columnsChoices} = selector;

        const [yearIndex, yearOptions] = getOptionsIndex(year, yearChoices);
        const [locationsIndex, locationsOptions] = getOptionsIndex(locations, locationsChoices);
        const [columnsIndex, columnsOptions] = getOptionsIndex(columns, columnsChoices);

        const handleYearSelect = e => {
            const index = parseInt(e.target.value);
            const [name] = yearOptions[index];
            dispatch(selectSubject(name, '', ''));
        }

        const handleLocationsSelect = e => {
            const index = parseInt(e.target.value);
            const [name] = locationsOptions[index];
            dispatch(selectSubject(year, name, ''));
        }

        const handleColumnsSelect = e => {
            const index = parseInt(e.target.value);
            const [name] = columnsOptions[index];
            dispatch(selectSubject(year, locations, name));
            onSwitchInput(-1, 1);
        }

        return (
            <div className="subject-selector">
                <label>Select subject set</label>
                <div className="form-row">
                    <div className="col-auto">
                        <label htmlFor="select-year">Year</label>
                        <select 
                            className="form-control" 
                            id="select-year" 
                            tabIndex="-1"
                            value={yearIndex}
                            onChange={handleYearSelect}
                        >
                            {yearOptions.map(([name, value]) => <option key={name} value={value}>{name}</option>)}
                        </select>
                    </div>
                    <div className="col-auto">
                        <label htmlFor="select-locations">Locations</label>
                        <select 
                            className="form-control" 
                            id="select-locations"
                            tabIndex="-1"
                            disabled={year === ''}
                            value={locationsIndex}
                            onChange={handleLocationsSelect}
                        >
                            {locationsOptions.map(([name, value]) => <option key={name} value={value}>{name}</option>)}
                        </select>
                    </div>
                     <div className="col-auto">
                        <label htmlFor="select-columns">Columns</label>
                        <select 
                            className="form-control" 
                            id="select-columns" 
                            tabIndex="-1"
                            disabled={locations === ''}
                            value={columnsIndex}
                            onChange={handleColumnsSelect} 
                        >
                            {columnsOptions.map(([name, value]) => <option key={name} value={value}>{name}</option>)}
                        </select>
                    </div>
  
                </div>
           </div>
        );
    }
}

Selector.propTypes = {
    selector: PropTypes.object.isRequired,
    onSwitchInput: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired
};

export default Selector;
