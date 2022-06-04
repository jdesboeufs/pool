import process from 'node:process'
import got from 'got'

const {SHELLY_CIRCULATION_URL, SHELLY_CIRCULATION_INDEX} = process.env

class Circulation {
  init() {
    setInterval(() => this.syncStatus(), 5 * 60 * 1000) // Every 5 minutes
    return this.syncStatus()
  }

  async syncStatus() {
    const json = await got(`${SHELLY_CIRCULATION_URL}/status`).json()
    this.updateStatus(json.relays[SHELLY_CIRCULATION_INDEX].ison ? 'active' : 'inactive')
  }

  updateStatus(newStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus
      this.statusSince = new Date()
    }
  }

  getStatus() {
    return this.status
  }
}

const circulation = new Circulation()
export default circulation
