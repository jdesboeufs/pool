#!/usr/bin/env node
import process from 'node:process'
import {format} from 'date-fns-tz'
import express from 'express'

import {initBus} from './lib/devices.js'
import {getStatus} from './lib/probe.js'

async function printStatus() {
  const status = await getStatus()
  console.log(getFormattedStatus(status))
}

function getFormattedStatus(status) {
  const {temperature, circulation, ph, orp} = status
  const date = format(new Date(), 'dd/MM/yyyy HH:mm', {timeZone: 'Europe/Paris'})
  return `${date} | Circulation ${circulation ? 'active' : 'inactive'} | Température : ${temperature.toFixed(1)}°C | pH : ${ph.toFixed(2)} | ORP : ${orp.toFixed(2)} mV`
}

function w(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

async function main() {
  await initBus()
  await printStatus()

  setInterval(async () => {
    await printStatus()
  }, 5 * 60 * 1000)

  const app = express()

  app.get('/', w(async (req, res) => {
    const status = await getStatus()
    res.send(getFormattedStatus(status))
  }))
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
