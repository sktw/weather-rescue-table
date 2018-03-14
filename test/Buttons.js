import React from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import sinon from 'sinon';

import './enzymeHelper';
import {createEvent} from './testUtils';

import Buttons from '../src/components/Buttons';
import {done, toggleUnclear} from '../src/actions';
import {objectAssign} from '../src/utils';


const baseProps = {
    results: {1: {copied: false}, 2: {copied: false}},
    focused: false,
    doneTabIndex: 10,
    dispatch: () => {},
    onSwitchInput: () => {}
};


describe('Buttons', () => {
    it('test with base props', () => {
        const props = objectAssign({}, baseProps);
        const container = shallow(<Buttons {...props} />);

        expect(container.find('button').at(1)).to.be.disabled();

    });

    it('test with all columns copied', () => {
        const props = objectAssign({}, baseProps, {results: {1: {copied: true}, 2: {copied: true}}});
        const container = shallow(<Buttons {...props} />);

        expect(container.find('button').at(1)).not.to.be.disabled();

    });

     it('dispatches done on click', () => {
        const dispatch = sinon.spy();

        const props = objectAssign({}, baseProps, {dispatch});
        const container = shallow(<Buttons {...props} />);

        container.find('button').at(1).simulate('click', createEvent({}));

        expect(dispatch.calledOnce).to.be.true;
        expect(dispatch.calledWith(done())).to.be.true;
    });

     it('dispatches done on keyDown with enter', () => {
        const dispatch = sinon.spy();

        const props = objectAssign({}, baseProps, {dispatch});
        const container = shallow(<Buttons {...props} />);

        container.find('button').at(1).simulate('keyDown', createEvent({keyCode: 13}));

        expect(dispatch.calledOnce).to.be.true;
        expect(dispatch.calledWith(done())).to.be.true;
    });

     it('dispatches unclear on click', () => {
        const dispatch = sinon.spy();

        const props = objectAssign({}, baseProps, {dispatch});
        const container = shallow(<Buttons {...props} />);

        container.find('button').at(0).simulate('mouseDown', createEvent({}));

        expect(dispatch.calledOnce).to.be.true;
        expect(dispatch.calledWith(toggleUnclear())).to.be.true;
    });
});
