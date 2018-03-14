import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import sinon from 'sinon';

import './enzymeHelper';
import './windowMock';
import {createEvent} from './testUtils';

import {copy, copyError} from '../src/actions';
import {ResultsInput} from '../src/components/Table';
import {objectAssign} from '../src/utils';
import * as Utils from '../src/utils';

const baseProps = {
    col: 1,
    row: 6,
    tabIndex: 6,
    copied: false,
    hasCopyError: false,
    focused: false,
    value: '',
    dispatch: () => {},
    onSwitchInput: () => {}
};

describe('ResultsInput', () => {
    beforeEach(() => {
        global.document = {
            execCommand: sinon.spy(() => true),
        };
        Utils.COPY_SUPPORTED = true;
    });

    it('test with base props', () => {
        const props = objectAssign({}, baseProps);
        const container = shallow(<ResultsInput {...props} />);

        expect(container.find('input')).prop('className').to.equal('form-control result-input');
        expect(container.find('button')).to.be.disabled();
    });

    it('test with value and uncopied', () => {
        const props = objectAssign({}, baseProps, {value: '30.43,29.74'});
        const container = shallow(<ResultsInput {...props} />);

        expect(container.find('input')).prop('className').to.equal('form-control result-input');
        expect(container.find('button')).to.not.be.disabled();
    });

    it('test with value and copied', () => {
        const props = objectAssign({}, baseProps, {value: '30.43,29.74', copied: true});
        const container = shallow(<ResultsInput {...props} />);
        
        expect(container.find('input')).prop('className').to.equal('form-control result-input is-valid');
        expect(container.find('button')).to.not.be.disabled();
    });

    it('test with value and hasCopyError', () => {
        const props = objectAssign({}, baseProps, {value: '30.43,29.74', hasCopyError: true});
        const container = shallow(<ResultsInput {...props} />);
        
        expect(container.find('input')).prop('className').to.equal('form-control result-input is-invalid');
        expect(container.find('button')).to.not.be.disabled();
    });

    it('disabled copy button if command not supported', () => {
        Utils.COPY_SUPPORTED = false;
        const props = objectAssign({}, baseProps, {value: '30.43,29.74'});
        const container = shallow(<ResultsInput {...props} />);
        
        expect(container.find('button')).to.be.disabled();
    });

    it('dispatches copy and calls onSwitchInput on click', () => {
        const dispatch = sinon.spy();
        const onSwitchInput = sinon.spy();
        global.document = {execCommand: sinon.spy(() => true)};

        const props = objectAssign({}, baseProps, {onSwitchInput, dispatch});
        const container = shallow(<ResultsInput {...props} />);
        container.instance().inputRef = {select: () => {}, setSelectionRange: () => {}, value: ''};

        container.find('button').simulate('click', createEvent({}));
        expect(document.execCommand.calledOnce).to.be.true;
        expect(document.execCommand.calledWith('copy')).to.be.true;

        expect(dispatch.calledOnce).to.be.true;
        expect(dispatch.calledWith(copy(1))).to.be.true;

        expect(onSwitchInput.calledOnce).to.be.true;
        expect(onSwitchInput.calledWith(6, 7)).to.be.true;
 
    });

    it('selects input on click', () => {
        const props = objectAssign({}, baseProps, {value: '30.43,29.74'});
        const container = shallow(<ResultsInput {...props} />);
        const select = sinon.spy();
        container.instance().inputRef = {select, setSelectionRange: () => {}, value: ''};

        container.find('input').simulate('click', createEvent({}));
        expect(select.calledOnce).to.be.true;
    });

    it('selects input on contextMenu', () => {
        const props = objectAssign({}, baseProps, {value: '30.43,29.74'});
        const container = shallow(<ResultsInput {...props} />);
        const select = sinon.spy();
        container.instance().inputRef = {select, setSelectionRange: () => {}, value: ''};

        container.find('input').simulate('contextMenu', createEvent({}));
        expect(select.calledOnce).to.be.true;
    });

    it('dispatches copy and calls onSwitchInput on copy input', () => {
        const dispatch = sinon.spy();

        const props = objectAssign({}, baseProps, {value: '30.43,29.74', dispatch});
        const container = shallow(<ResultsInput {...props} />);
        container.instance().inputRef = {select: () => {}, setSelectionRange: () => {}, value: ''};

        container.find('input').simulate('focus', createEvent({}));
        container.find('input').simulate('copy', createEvent({}));

        expect(dispatch.calledOnce).to.be.true;
        expect(dispatch.calledWith(copy(1))).to.be.true;
    });

    it('dispatches copy and calls onSwitchInput on keyDown with enter key', () => {
        const dispatch = sinon.spy();
        const onSwitchInput = sinon.spy();
        global.document = {execCommand: sinon.spy(() => true)};

        const props = objectAssign({}, baseProps, {onSwitchInput, dispatch});
        const container = shallow(<ResultsInput {...props} />);
        container.instance().inputRef = {select: () => {}, setSelectionRange: () => {}, value: ''};

        container.find('button').simulate('keyDown', createEvent({keyCode: 13}));
        expect(document.execCommand.calledOnce).to.be.true;
        expect(document.execCommand.calledWith('copy')).to.be.true;

        expect(dispatch.calledOnce).to.be.true;
        expect(dispatch.calledWith(copy(1))).to.be.true;

        expect(onSwitchInput.calledOnce).to.be.true;
        expect(onSwitchInput.calledWith(6, 7)).to.be.true;
    });

    it('dispatches copyError if execCommand returns false', () => {
        global.document.execCommand = () => false;
        const dispatch = sinon.spy();

        const props = objectAssign({}, baseProps, {value: '30.43,29.74', dispatch});
        const container = shallow(<ResultsInput {...props} />);
        container.instance().inputRef = {select: () => {}, setSelectionRange: () => {}, value: ''};

        container.find('button').simulate('click', createEvent({}));
        expect(dispatch.calledOnce).to.be.true;
        expect(dispatch.calledWith(copyError(1))).to.be.true;
    });

    it('dispatches copyError if execCommand throws exception', () => {
        global.document.execCommand = () => {throw new Error()};
        const dispatch = sinon.spy();

        const props = objectAssign({}, baseProps, {value: '30.43,29.74', dispatch});
        const container = shallow(<ResultsInput {...props} />);
        container.instance().inputRef = {select: () => {}, setSelectionRange: () => {}, value: ''};

        container.find('button').simulate('click', createEvent({}));
        expect(dispatch.calledOnce).to.be.true;
        expect(dispatch.calledWith(copyError(1))).to.be.true;
    });

    it('calls onSwitchInput on keyDown with down key', () => {
        const onSwitchInput = sinon.spy();
        const props = objectAssign({}, baseProps, {onSwitchInput});
        const container = shallow(<ResultsInput {...props} />);

        container.find('button').simulate('keyDown', createEvent({keyCode: 40}));
        expect(onSwitchInput.calledOnce).to.be.true;
        expect(onSwitchInput.calledWith(6, 7)).to.be.true;
    });

    it('calls onSwitchInput on keyDown with up key', () => {
        const onSwitchInput = sinon.spy();
        const props = objectAssign({}, baseProps, {onSwitchInput});
        const container = shallow(<ResultsInput {...props} />);

        container.find('button').simulate('keyDown', createEvent({keyCode: 38}));
        expect(onSwitchInput.calledOnce).to.be.true;
        expect(onSwitchInput.calledWith(6, 5)).to.be.true;
    });
});
