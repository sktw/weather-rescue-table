import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import sinon from 'sinon';

import './enzymeHelper';
import {createEvent} from './testUtils';

import Selector from '../src/components/Selector';
import {selectSubject} from '../src/actions';
import {objectAssign} from '../src/utils';

const baseProps = {
    selector: {
        year: '',
        locations: '',
        columns: '',
        yearChoices: ['2017', '2018'],
        locationsChoices: [],
        columnsChoices: []
    },
    dispatch: () => {},
    onSwitchInput: () => {}
};


describe('Selector', () => {
    it('test with base props', () => {
        const props = objectAssign({}, baseProps);
        const container = shallow(<Selector {...props} />);

        const selects = container.find('select');
        expect(selects).to.have.length(3);
        const yearSelect = selects.at(0);
        expect(yearSelect.find('option')).to.have.length(3);

        const locationsSelect = selects.at(1);
        expect(locationsSelect).to.be.disabled();
        expect(locationsSelect.find('option')).to.have.length(1);

        const columnsSelect = selects.at(2);
        expect(columnsSelect).to.be.disabled();
        expect(columnsSelect.find('option')).to.have.length(1);
    });

    it('test with selected year', () => {
        const selector = objectAssign({}, baseProps.selector, {year: '2017', locationsChoices: ['Southampton - Brighton', 'Ventnor - Cowes']});
        const props = objectAssign({}, baseProps, {selector});

        const container = shallow(<Selector {...props} />);

        const selects = container.find('select');
        expect(selects).to.have.length(3);
        const yearSelect = selects.at(0);
        expect(yearSelect).to.have.value('1');
        expect(yearSelect.find('option')).to.have.length(3);

        const locationsSelect = selects.at(1);
        expect(locationsSelect.find('option')).to.have.length(3);

        const columnsSelect = selects.at(2);
        expect(columnsSelect).to.be.disabled();
        expect(columnsSelect.find('option')).to.have.length(1);
    });

    it('test with selected year and locations', () => {
        const selector = objectAssign({}, baseProps.selector, {year: '2017', locations: 'Ventnor - Cowes', locationsChoices: ['Southampton - Brighton', 'Ventnor - Cowes'], columnsChoices: ['Pressure Temp.', 'Max Min Rainfall']});

        const props = objectAssign({}, baseProps, {selector});

        const container = shallow(<Selector {...props} />);

        const selects = container.find('select');
        expect(selects).to.have.length(3);
        const yearSelect = selects.at(0);
        expect(yearSelect).to.have.value('1');
        expect(yearSelect.find('option')).to.have.length(3);

        const locationsSelect = selects.at(1);
        expect(locationsSelect).to.have.value('2');
        expect(locationsSelect.find('option')).to.have.length(3);

        const columnsSelect = selects.at(2);
        expect(columnsSelect.find('option')).to.have.length(3);
    });

    it('test with selected year and locations and columns', () => {
        const selector = objectAssign({}, baseProps.selector, {year: '2017', locations: 'Ventnor - Cowes', columns: 'Max Min Rainfall', locationsChoices: ['Southampton - Brighton', 'Ventnor - Cowes'], columnsChoices: ['Pressure Temp.', 'Max Min Rainfall']});

        const props = objectAssign({}, baseProps, {selector});

        const container = shallow(<Selector {...props} />);

        const selects = container.find('select');
        expect(selects).to.have.length(3);
        const yearSelect = selects.at(0);
        expect(yearSelect).to.have.value('1');
        expect(yearSelect.find('option')).to.have.length(3);

        const locationsSelect = selects.at(1);
        expect(locationsSelect).to.have.value('2');
        expect(locationsSelect.find('option')).to.have.length(3);

        const columnsSelect = selects.at(2);
        expect(columnsSelect).to.have.value('2');
        expect(columnsSelect.find('option')).to.have.length(3);
    });

    it('dispatches selectSubject when year selected', () => {
        const dispatch = sinon.spy();
        const props = objectAssign({}, baseProps, {dispatch});
        const container = shallow(<Selector {...props} />);

        container.find('select').at(0).simulate('change', createEvent({target: {value: '1'}}));
        expect(dispatch.calledOnce).to.be.true;
        expect(dispatch.calledWith(selectSubject('2017', '', ''))).to.be.true;
    });

    it('dispatches selectSubject when locations selected', () => {
        const dispatch = sinon.spy();
        const selector = objectAssign({}, baseProps.selector, {year: '2017', locationsChoices: ['Southampton - Brighton', 'Ventnor - Cowes']});
        const props = objectAssign({}, baseProps, {dispatch, selector});

        const container = shallow(<Selector {...props} />);
        
        container.find('select').at(1).simulate('change', createEvent({target: {value: '2'}}));
        expect(dispatch.calledOnce).to.be.true;
        expect(dispatch.calledWith(selectSubject('2017', 'Ventnor - Cowes', ''))).to.be.true;
   });

    it('dispatches selectSubject and onSwitchInput when columns selected', () => {
        const dispatch = sinon.spy();
        const onSwitchInput = sinon.spy();
        const selector = objectAssign({}, baseProps.selector, {year: '2017', locations: 'Ventnor - Cowes', locationsChoices: ['Southampton - Brighton', 'Ventnor - Cowes'], columnsChoices: ['Pressure Temp.', 'Max Min Rainfall']});

        const props = objectAssign({}, baseProps, {dispatch, selector, onSwitchInput});

        const container = shallow(<Selector {...props} />);

        container.find('select').at(2).simulate('change', createEvent({target: {value: '1'}}));
        expect(dispatch.calledOnce).to.be.true;
        expect(dispatch.calledWith(selectSubject('2017', 'Ventnor - Cowes', 'Pressure Temp.'))).to.be.true;

        expect(onSwitchInput.calledOnce).to.be.true;
        expect(onSwitchInput.calledWith(-1, 1)).to.be.true;
    });
});
