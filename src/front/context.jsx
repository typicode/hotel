import React from 'react'
import { Subscriber } from 'react-broadcast'

export const isDarkChannel = 'isDark'

const subscriberHOC = channel => ChildComponent => {
  // WARNING: This component can’t have a `ref` :(
  const NewComponent = props => (
    <Subscriber channel={channel}>
      {value => <ChildComponent {...{ ...props, [channel]: value }} />}
    </Subscriber>
  )

  const displayName =
    ChildComponent.displayName || ChildComponent.name || 'Component'
  NewComponent.displayName = `Subscriber<${channel}>(${displayName})`

  return NewComponent
}

export const subscribe = (...subscriptions) => component => {
  for (const channel of subscriptions) {
    component = subscriberHOC(channel)(component)
  }
  return component
}
