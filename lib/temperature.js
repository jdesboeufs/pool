import {execCommand} from './devices.js'

class Temperature {
  init() {
    setInterval(() => this.syncValue(), 5 * 60 * 1000) // Every 5 minutes
    return this.syncValue()
  }

  async syncValue() {
    this.value = await execCommand('temp', 'read')
    this.valueDate = new Date()
  }

  getValue() {
    return this.value
  }

  getValueDate() {
    return this.valueDate
  }
}

const temperature = new Temperature()

export default temperature
