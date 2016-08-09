import React from 'react';
import { render } from 'react-dom';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { AppContainer } from 'react-hot-loader';
import Root from './scripts/frontend/containers/Root';
import rootReducer from './scripts/frontend/reducers';
import { createStore } from 'redux';


function configureStore(initialState) {
    const store = createStore(
        rootReducer,
        initialState
    );

    return store;
}

const store = configureStore();

const history = syncHistoryWithStore(browserHistory, store);


render(
    <AppContainer>
        <Root store={store} history={history} />
    </AppContainer>,
    document.getElementById('root')
);

if (module.hot) {
    module.hot.accept('./scripts/frontend/containers/Root', () => {
        const NewRoot = new Root().default;
        render(
            <AppContainer>
                <NewRoot store={store} history={history} />
            </AppContainer>,
            document.getElementById('root')
        );
    });
}
