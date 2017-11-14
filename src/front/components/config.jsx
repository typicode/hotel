import React from 'react'
import PropTypes from 'prop-types'

import { IconButton } from './button'
import { Icon } from './icon'

import { Main } from './main'

export const Config = ({ onSave, output, mon, ...props }) => (
  <Main
    title={<Icon name="settings" size="medium" style={{ margin: '-1rem' }} />}
    mobileTitle={[<Icon key="icon" name="settings" size="medium" />, 'Config']}
    extraButton={
      <IconButton themed title="save" onClick={onSave} icon="checkmark" />
    }
    {...props}
  >
    <h1
      className="title is-1 is-hidden-mobile has-text-centered"
      style={{ marginTop: '0.5em', color: 'inherit' }}
    >
      Config
    </h1>
    {/* TODO: Add config */}
  </Main>
)

Config.propTypes = {
  onSave: PropTypes.func,
  output: PropTypes.object,
  mon: PropTypes.object,
  ...Main.propTypes
}
delete Config.propTypes.children
