import process from 'node:process'

import Circulation from './circulation.js'
import Temperature from './temperature.js'
import Ph from './ph.js'
import Orp from './orp.js'

const {DISABLE_PH, DISABLE_ORP} = process.env

export function getStatus() {
  const temperature = Temperature.getValue()
  const ph = DISABLE_PH !== '1' ? Ph.getValue() : null
  const orp = DISABLE_ORP !== '1' ? Orp.getValue() : null
  const circulation = Circulation.getStatus()
  return {temperature, circulation, ph, orp}
}
