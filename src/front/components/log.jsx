import React from 'react'
import PropTypes from 'prop-types'
import ansi2HTML from 'ansi2html'
import escapeHTML from 'escape-html'
import Moment from 'react-moment'

import { blankLine } from '../common'

export const Log = ({ item }) => (
  <div className="log-line" data-log-type={item.get('type')}>
    <div
      className="log-body"
      dangerouslySetInnerHTML={{
        __html: blankLine(ansi2HTML(escapeHTML(item.get('data'))))
      }}
    />
    <Moment fromNow interval={5e3} className="timestamp">
      {item.get('date')}
    </Moment>
  </div>
)

Log.propTypes = {
  item: PropTypes.object.isRequired
}
