import process from 'node:process'
import got from 'got'

const {SHELLY_CIRCULATION_URL, SHELLY_CIRCULATION_INDEX} = process.env

export async function getCirculationStatus() {
  const json = await got(`${SHELLY_CIRCULATION_URL}/status`).json()
  return json.relays[SHELLY_CIRCULATION_INDEX].ison
}
