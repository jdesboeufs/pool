import {execCommand} from './devices.js'

class Temperature {
  init() {
    setInterval(() => this.syncValue(), 60 * 1000) // Every minute
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
