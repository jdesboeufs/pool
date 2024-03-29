import {execCommand} from './devices.js'

class Ph {
  init() {
    setInterval(() => this.syncValue(), 60 * 1000) // Every minute
    return this.syncValue()
  }

  async syncValue() {
    this.value = await execCommand('ph', 'read')
    this.valueDate = new Date()
  }

  getValue() {
    return this.value
  }

  getValueDate() {
    return this.valueDate
  }
}

const ph = new Ph()

export default ph
