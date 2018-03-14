import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import sinon from 'sinon';

import './enzymeHelper';
import './windowMock';
import {createEvent} from './testUtils';

import {ValueInput} from '../src/components/Table';
import {beginUpdateValue, endUpdateValue, updateValue} from '../src/actions';
import {objectAssign} from '../src/utils';

const baseProps = {
    col: 1,
    row: 3,
    tabIndex: 3,
    edited: false,
    focused: false,
    unclear: false, 
    value: '',
    valueType: 'pressure',
    partialErrors: [],
    fullErrors: [],
    onSwitchInput: () => {},
    dispatch: () => {}
};


describe('ValueInput', () => {
    it('test with base props', () => {
        const props = objectAssign({}, baseProps);

        const container = shallow(<ValueInput {...props} />);
        expect(container).prop('className').to.equal('input-group value-group');
        expect(container.find('Icon')).to.have.prop('iconName', 'wi-day-sunny');
    });

    it('test with focused and no value', () => {
        const props = objectAssign({}, baseProps, {value: '', focused: true});
        const container = shallow(<ValueInput {...props} />);
        expect(container).prop('className').to.equal('input-group value-group');
        expect(container.find('Icon')).to.have.prop('iconName', 'wi-day-sunny');
    });

    it('test with focused and edited with no partial errors', () => {
        const props = objectAssign({}, baseProps, {value: '3', focused: true, edited: true});
        const container = shallow(<ValueInput {...props} />);
        expect(container).prop('className').to.equal('input-group value-group');
        expect(container.find('Icon')).to.have.prop('iconName', 'wi-day-sunny');
    });

    it('test with focused and edited with partial errors', () => {
        const props = objectAssign({}, baseProps, {value: '4', focused: true, edited: true, partialErrors: ['Does not match expected pattern'], fullErrors: ['Does not match expected pattern']});
        const container = shallow(<ValueInput {...props} />);
        expect(container).prop('className').to.equal('input-group value-group is-invalid');
        expect(container.find('Icon')).to.have.prop('iconName', 'wi-rain');
    });

    it('test unfocused and edited with full errors', () => {
        const props = objectAssign({}, baseProps, {value: '30', focused: false, edited: true, partialErrors: [], fullErrors: ['Does not match expected pattern'], });
        const container = shallow(<ValueInput {...props} />);
        expect(container).prop('className').to.equal('input-group value-group is-invalid');
        expect(container.find('Icon')).to.have.prop('iconName', 'wi-rain');
    });

    it('test unfocused and edited with no errors', () => {
        const props = objectAssign({}, baseProps, {value: '30.45', focused: false, edited: true});
        const container = shallow(<ValueInput {...props} />);
        expect(container).prop('className').to.equal('input-group value-group is-valid');
        expect(container.find('Icon')).to.have.prop('iconName', 'wi-day-sunny');
    });

    it('test focused and edited and unclear', () => {
        const props = objectAssign({}, baseProps, {value: '4', focused: true, edited: true, partialErrors: ['Does not match expected pattern'], fullErrors: ['Does not match expected pattern'], unclear: true});
        const container = shallow(<ValueInput {...props} />);
        expect(container).prop('className').to.equal('input-group value-group is-unclear');
        expect(container.find('Icon')).to.have.prop('iconName', 'wi-cloud');
    });

    it('test unfocused and edited and unclear', () => {
        const props = objectAssign({}, baseProps, {value: '4', focused: false, edited: true, partialErrors: ['Does not match expected pattern'], fullErrors: ['Does not match expected pattern'], unclear: true});
        const container = shallow(<ValueInput {...props} />);
        expect(container).prop('className').to.equal('input-group value-group is-valid is-unclear');
        expect(container.find('Icon')).to.have.prop('iconName', 'wi-cloud');
    });

    it('selects input on focus', () => {
        const props = objectAssign({}, baseProps);
        const container = shallow(<ValueInput {...props} />);
        const select = sinon.spy();
        const event = createEvent({target: {select, setSelectionRange: () => {}, value: ''}});

        container.find('input').simulate('focus', event);
        expect(select.calledOnce).to.be.true;
    });

    it('selects input on click', () => {
        const props = objectAssign({}, baseProps);
        const container = shallow(<ValueInput {...props} />);
        const select = sinon.spy();

        const event = createEvent({target: {select, setSelectionRange: () => {}, value: ''}});
        container.find('input').simulate('click', event);
        expect(select.calledOnce).to.be.true;
    });

    it('calls onSwitchInput on keyDown with enter key', () => {
        const onSwitchInput = sinon.spy();
        const props = objectAssign({}, baseProps, {onSwitchInput});
        const container = shallow(<ValueInput {...props} />);

        container.find('input').simulate('keyDown', createEvent({keyCode: 13}));
        expect(onSwitchInput.calledOnce).to.be.true;
        expect(onSwitchInput.calledWith(3, 4)).to.be.true;
    });

    it('calls onSwitchInput on keyDown with down key', () => {
        const onSwitchInput = sinon.spy();
        const props = objectAssign({}, baseProps, {onSwitchInput});
        const container = shallow(<ValueInput {...props} />);

        container.find('input').simulate('keyDown', createEvent({keyCode: 40}));
        expect(onSwitchInput.calledOnce).to.be.true;
        expect(onSwitchInput.calledWith(3, 4)).to.be.true;
    });

    it('calls onSwitchInput on keyDown with up key', () => {
        const onSwitchInput = sinon.spy();
        const props = objectAssign({}, baseProps, {onSwitchInput});
        const container = shallow(<ValueInput {...props} />);

        container.find('input').simulate('keyDown', createEvent({keyCode: 38}));
        expect(onSwitchInput.calledOnce).to.be.true;
        expect(onSwitchInput.calledWith(3, 2)).to.be.true;
    });

    it('dispatches valueChange when input value changes', () => {
        const dispatch = sinon.spy();
        const props = objectAssign({}, baseProps, {dispatch});
        const container = shallow(<ValueInput {...props} />);

        container.find('input').simulate('change', createEvent({target: {value: '30'}}));
        expect(dispatch.calledOnce).to.be.true;
        expect(dispatch.calledWith(updateValue('30', [], ['Does not match expected pattern'], false))).to.be.true;
    });

    it('dispatches beginUpdateValue when input is focused', () => {
        const dispatch = sinon.spy();
        const props = objectAssign({}, baseProps, {dispatch});
        const container = shallow(<ValueInput {...props} />);

        const event = createEvent({target: {select: () => {}, setSelectionRange: () => {}, value: ''}});
        container.instance().handleFocus(event);

        expect(dispatch.calledOnce).to.be.true;
        expect(dispatch.calledWith(beginUpdateValue(1, 3))).to.be.true;
    });

    it('calls onBlur when input is blured and edited', () => {
        const dispatch = sinon.spy();
        const props = objectAssign({}, baseProps, {dispatch, edited: true});
        const container = shallow(<ValueInput {...props} />);
        container.instance().handleBlur(createEvent({}));

        expect(dispatch.calledOnce).to.be.true;
        expect(dispatch.calledWith(endUpdateValue())).to.be.true;
    });

    it('calls onChange and onBlur when input is blured and unedited', () => {
        const dispatch = sinon.spy();
        const props = objectAssign({}, baseProps, {dispatch});
        const container = shallow(<ValueInput {...props} />);
        container.instance().handleBlur(createEvent({target: {value: '30'}}));

        expect(dispatch.calledTwice).to.be.true;
    });
});
