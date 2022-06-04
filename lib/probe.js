import got from 'got'
import {execCommand} from './devices.js'

async function getCirculationStatus() {
  const json = await got('http://192.168.1.54/status').json()
  return json.relays[0].ison
}

export async function getStatus() {
  const temperature = await execCommand('temp', 'read')
  const ph = await execCommand('ph', 'read')
  const circulation = await getCirculationStatus()
  const orp = await execCommand('orp', 'read')
  return {temperature, circulation, ph, orp}
}
