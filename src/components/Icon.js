import React from 'react';
import PropTypes from 'prop-types';
import {classList} from '../utils';

function Icon(props) {
    const {iconName, classes = ''} = props;

    const className = classList([
        ['icon', true],
        [iconName, true],
        [classes, classes !== ''],
    ]);

    return (
        <svg className={className} aria-hidden="true">
            <use xlinkHref={'#' + iconName}></use>
        </svg>
    );
}

Icon.propTypes = {
    iconName: PropTypes.string.isRequired,
    classes: PropTypes.string
};

export default Icon;
