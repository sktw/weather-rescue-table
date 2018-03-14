import React from 'react';
import PropTypes from 'prop-types';
import {done, toggleUnclear} from '../actions';
import Icon from './Icon';

class Buttons extends React.Component {
    constructor(props) {
        super(props);
        this.handleDone = this.handleDone.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleUnclear = this.handleUnclear.bind(this);
    }

    handleDone(e) {
        e.preventDefault();
        this.props.dispatch(done());
        this.props.onSwitchInput(this.props.doneTabIndex, 1);
    }

    handleKeyDown(e) {
        const code = e.keyCode;
        if (code === 13) {
            this.handleDone(e);
        }
    }

    handleUnclear(e) {
        e.preventDefault();
        this.props.dispatch(toggleUnclear());
    }

    render() {
        const {results, doneTabIndex} = this.props;

        const doneDisabled = Object.keys(results).reduce((disabled, col) => disabled || !results[col].copied, false);

        return (
            <div className="buttons">
                <button 
                    className="btn btn-outline-secondary" 
                    type="button" 
                    title="Unclear" 
                    tabIndex="-1" 
                    onMouseDown={this.handleUnclear}
                ><Icon iconName="wi-cloud" /> unclear</button>
                <button 
                    className="btn btn-success float-right" 
                    type="button" 
                    title="Done" 
                    tabIndex={doneTabIndex}
                    disabled={doneDisabled}
                    onClick={this.handleDone} 
                    onKeyDown={this.handleKeyDown}
                >Done</button>
            </div>
        );
    }
}

Buttons.propTypes = {
    doneTabIndex: PropTypes.number.isRequired,
    results: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    onSwitchInput: PropTypes.func.isRequired
};

export default Buttons;
