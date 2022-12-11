import process from 'node:process'
import got from 'got'

const {SHELLY_CIRCULATION_URL, SHELLY_CIRCULATION_INDEX} = process.env

class Circulation {
  init() {
    setInterval(() => this.syncStatus(), 60 * 1000) // Every minute
    return this.syncStatus()
  }

  async syncStatus() {
    const json = await got(`${SHELLY_CIRCULATION_URL}/relay/${SHELLY_CIRCULATION_INDEX}`).json()
    this.updateStatus(json.ison ? 'active' : 'inactive')
  }

  updateStatus(newStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus
      this.statusSince = new Date()
    }
  }

  async start() {
    const json = await got(`${SHELLY_CIRCULATION_URL}/relay/${SHELLY_CIRCULATION_INDEX}`, {searchParams: {turn: 'on'}}).json()
    this.updateStatus(json.ison ? 'active' : 'inactive')
  }

  async stop() {
    const json = await got(`${SHELLY_CIRCULATION_URL}/relay/${SHELLY_CIRCULATION_INDEX}`, {searchParams: {turn: 'off'}}).json()
    this.updateStatus(json.ison ? 'active' : 'inactive')
  }

  getStatus() {
    return this.status
  }
}

const circulation = new Circulation()
export default circulation
