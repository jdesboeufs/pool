import {execCommand} from './devices.js'
import Circulation from './circulation.js'

export async function getStatus() {
  const temperature = await execCommand('temp', 'read')
  const ph = await execCommand('ph', 'read')
  const circulation = Circulation.getStatus()
  const orp = await execCommand('orp', 'read')
  return {temperature, circulation, ph, orp}
}
