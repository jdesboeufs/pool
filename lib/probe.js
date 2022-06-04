import Circulation from './circulation.js'
import Temperature from './temperature.js'
import Ph from './ph.js'
import Orp from './orp.js'

export function getStatus() {
  const temperature = Temperature.getValue()
  const ph = Ph.getValue()
  const orp = Orp.getValue()
  const circulation = Circulation.getStatus()
  return {temperature, circulation, ph, orp}
}
