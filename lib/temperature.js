import {execCommand} from './devices.js'

class Temperature {
  init() {
    setInterval(() => this.syncValue(), 5 * 60 * 1000) // Every 5 minutes
    return this.syncValue()
  }

  async syncValue() {
    this.value = await execCommand('temp', 'read')
  }

  getValue() {
    return this.value
  }
}

const temperature = new Temperature()

export default temperature
