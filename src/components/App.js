import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import Selector from './Selector';
import Table from './Table';
import Buttons from './Buttons';
import {TabIndexGenerator} from './componentUtils';
import {blurTabIndex, focusTabIndex} from '../utils';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.handleSwitchInput = this.handleSwitchInput.bind(this);
        this.updateHeight = this.updateHeight.bind(this);
        this.state = {nextTabIndex: -1};
        this.appRef = null;
        this.wrapperRef = null;
    }

    updateHeight() {
        // ensure that user can scroll table to top of window
        // require total document height of at least window.innerHeight + this.wrapperRef.offsetTop
        // if document already long enough due to content length, set height to auto
        // else set height of app to fulfill above condition
        // set the height directly on element to avoid any potential problems with 
        // recursively calling setState

        if (this.wrapperRef !== null) {
            let height;

            if (window.innerHeight < this.wrapperRef.offsetHeight) {
                height = 'auto';
            }
            else {
                height = (window.innerHeight + this.wrapperRef.offsetTop - this.appRef.offsetTop) + 'px';
            }

            if (this.appRef.style.height !== height) {
                this.appRef.style.height = height;
            }
        }
    }

    updateTabIndex() {
        const {nextTabIndex} = this.state;

        if (nextTabIndex !== -1) {
            focusTabIndex(nextTabIndex);
            this.setState({nextTabIndex: -1});
        }
    }
 
    handleSwitchInput(currentTabIndex, nextTabIndex) {
        blurTabIndex(currentTabIndex);
        this.setState({nextTabIndex});
    }

    componentDidMount() {
        window.addEventListener('resize', this.updateHeight);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateHeight);
    }

    componentDidUpdate() {
        this.updateHeight();
        this.updateTabIndex();        
    }

    render() {
        const {selector, manifest, table, results, dispatch, current} = this.props;

        if (manifest) {
            const tabIndexGen = new TabIndexGenerator(manifest);
            const doneTabIndex = tabIndexGen.doneTabIndex();

            return (
                <div className="app" ref={el => this.appRef = el}>
                    <Selector 
                        selector={selector} 
                        onSwitchInput={this.handleSwitchInput}
                        dispatch={dispatch}
                    />
                    <div className="wrapper" ref={el => this.wrapperRef = el}>
                       <Table 
                            manifest={manifest} 
                            dispatch={dispatch} 
                            table={table} 
                            results={results} 
                            current={current} 
                            onSwitchInput={this.handleSwitchInput}
                        />
                        <Buttons 
                            dispatch={dispatch} 
                            doneTabIndex={doneTabIndex} 
                            results={results} 
                            onSwitchInput={this.handleSwitchInput}
                        />
                    </div>
                </div>
            );
        }
        else {
            return (
                <div className="app" ref={el => this.appRef = el}>
                    <Selector 
                        selector={selector}
                        onSwitchInput={this.handleSwitchInput}
                        dispatch={dispatch}
                    />
                </div>
            );
        }
    }
}

App.propTypes = {
    manifest: PropTypes.object,
    selector: PropTypes.object.isRequired,
    table: PropTypes.object,
    results: PropTypes.object,
    current: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
};

function mapStateToProps(storeState) {
    const {selector, manifest, table, results, current} = storeState;
    return {
        selector,
        manifest,
        table,
        results,
        current
    }
}

export default connect(
    mapStateToProps
)(App);
