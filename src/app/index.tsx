import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './components/App'
import Store from './Store'

const store = new Store()
ReactDOM.render(<App store={store} />, document.getElementById('root'))
