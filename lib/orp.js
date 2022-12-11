import {execCommand} from './devices.js'

class Orp {
  init() {
    setInterval(() => this.syncValue(), 5 * 60 * 1000) // Every 5 minutes
    return this.syncValue()
  }

  async syncValue() {
    this.value = await execCommand('orp', 'read')
    this.valueDate = new Date()
  }

  getValue() {
    return this.value
  }

  getValueDate() {
    return this.valueDate
  }
}

const orp = new Orp()

export default orp
