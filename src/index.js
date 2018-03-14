import React from 'react';
import ReactDOM from 'react-dom';

import {createStore} from 'redux';
import {Provider} from 'react-redux';
import rootReducer from './reducers';
import {loadManifests} from './actions';
import App from './components/App';

import manifests from 'manifests';

const store = createStore(rootReducer);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('app')
);

store.dispatch(loadManifests(manifests));
