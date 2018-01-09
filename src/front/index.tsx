import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './components/App'
import Store from './stores/Store'

// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
// const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)))

const store = new Store()

ReactDOM.render(<App store={store} />, document.getElementById('root'))
