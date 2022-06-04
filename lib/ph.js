import {execCommand} from './devices.js'

class Ph {
  init() {
    setInterval(() => this.syncValue(), 5 * 60 * 1000) // Every 5 minutes
    return this.syncValue()
  }

  async syncValue() {
    this.value = await execCommand('ph', 'read')
  }

  getValue() {
    return this.value
  }
}

const ph = new Ph()

export default ph
