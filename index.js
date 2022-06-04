#!/usr/bin/env node
import process from 'node:process'
import {format} from 'date-fns-tz'

import {initBus} from './lib/devices.js'
import {getStatus} from './lib/probe.js'

async function printStatus() {
  const {temperature, circulation, ph, orp} = await getStatus()
  const date = format(new Date(), 'dd/MM/yyyy HH:mm', {timeZone: 'Europe/Paris'})
  console.log(`${date} | Circulation ${circulation ? 'active' : 'inactive'} | Température : ${temperature.toFixed(1)}°C | pH : ${ph.toFixed(2)} | ORP : ${orp.toFixed(2)} mV`)
}

async function main() {
  await initBus()
  await printStatus()

  setInterval(async () => {
    await printStatus()
  }, 5 * 60 * 1000)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
