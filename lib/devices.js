import Buffer from 'node:buffer'
import {setTimeout} from 'node:timers/promises'
import i2c from 'i2c-bus'

let bus = null

const ezoDefinitions = {
  prs: {
    commands: {
      read: {
        command: 'R',
        delay: 900,
        parse: v => Number.parseFloat(v)
      }
    }
  },
  rtd: {
    commands: {
      read: {
        command: 'R',
        delay: 600,
        parse: v => Number.parseFloat(v)
      }
    }
  },
  ph: {
    commands: {
      read: {
        command: 'R',
        delay: 900,
        parse: v => Number.parseFloat(v)
      }
    }
  },
  orp: {
    commands: {
      read: {
        command: 'R',
        delay: 900,
        parse: v => Number.parseFloat(v)
      }
    }
  }
}

const devices = {
  pressure: {
    addr: 0x6A,
    type: 'prs'
  },
  pump: {
    addr: 0x67,
    type: 'pmp'
  },
  temp: {
    addr: 0x66,
    type: 'rtd'
  },
  ph: {
    addr: 0x63,
    type: 'ph'
  },
  orp: {
    addr: 0x62,
    type: 'orp'
  }
}

export async function initBus() {
  bus = await i2c.openPromisified(1)
}

export async function execRawCommand(device, command, delay) {
  const {addr} = devices[device]
  await bus.i2cWrite(addr, command.length, Buffer.from(command))
  await setTimeout(delay)
  const writeBuffer = Buffer.alloc(40)
  await bus.i2cRead(addr, 40, writeBuffer)
  const responseCode = writeBuffer[0]
  const endOfValue = writeBuffer.indexOf(0x00)
  const value = writeBuffer.subarray(1, endOfValue).toString()
  return {responseCode, value}
}

export async function execCommand(device, userCommand) {
  const {type} = devices[device]
  const definition = ezoDefinitions[type]
  const {command, delay, parse} = definition.commands[userCommand]
  const {value} = await execRawCommand(device, command, delay)
  return parse(value)
}
