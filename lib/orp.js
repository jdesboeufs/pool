import {execCommand} from './devices.js'

class Orp {
  init() {
    setInterval(() => this.syncValue(), 5 * 60 * 1000) // Every 5 minutes
    return this.syncValue()
  }

  async syncValue() {
    this.value = await execCommand('orp', 'read')
  }

  getValue() {
    return this.value
  }
}

const orp = new Orp()

export default orp
