import process from 'node:process'
import got from 'got'
import {execCommand} from './devices.js'

const {SHELLY_CIRCULATION_URL, SHELLY_CIRCULATION_INDEX} = process.env

async function getCirculationStatus() {
  const json = await got(`${SHELLY_CIRCULATION_URL}/status`).json()
  return json.relays[SHELLY_CIRCULATION_INDEX].ison
}

export async function getStatus() {
  const temperature = await execCommand('temp', 'read')
  const ph = await execCommand('ph', 'read')
  const circulation = await getCirculationStatus()
  const orp = await execCommand('orp', 'read')
  return {temperature, circulation, ph, orp}
}
