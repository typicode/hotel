import { observer } from 'mobx-react'
import * as React from 'react'
import Store from '../../Store'
import Content from '../Content'
import Nav from '../Nav'
import Splash from '../Splash'
import './index.css'

export interface IProps {
  store: Store
}

function App({ store }: IProps) {
  return (
    <div className="container">
      <Nav store={store} />
      {store.selectedMonitorId ? <Content store={store} /> : <Splash />}
    </div>
  )
}

export default observer(App)
