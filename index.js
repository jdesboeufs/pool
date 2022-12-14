#!/usr/bin/env node
/* eslint import/no-unassigned-import: off */
import process from 'node:process'

import 'dotenv/config.js'
import {format} from 'date-fns-tz'
import express from 'express'
import morgan from 'morgan'

import {initBus} from './lib/devices.js'
import {getStatus} from './lib/probe.js'
import Circulation from './lib/circulation.js'
import Temperature from './lib/temperature.js'
import Orp from './lib/orp.js'
import Ph from './lib/ph.js'

const {SHELLY_ACTIONS_KEY, FROST_PROTECTION_MODE, DISABLE_ORP, DISABLE_PH} = process.env

function printStatus() {
  const status = getStatus()
  console.log(getFormattedStatus(status))
}

function getFormattedStatus(status) {
  const {temperature, circulation, ph, orp} = status
  const date = format(new Date(), 'dd/MM/yyyy HH:mm', {timeZone: 'Europe/Paris'})
  return `${date} | Circulation ${circulation} | Température : ${temperature.toFixed(1)}°C | pH : ${ph ? ph.toFixed(2) : 'N/A'} | ORP : ${orp ? orp.toFixed(2) : 'N/A'} mV`
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

function getPHStatus(ph) {
  if (!ph) {
    return ''
  }

  if (ph >= 7 && ph <= 7.4) {
    return 'green'
  }

  if ((ph > 7.4 && ph < 7.6) || (ph < 7 && ph > 6.9)) {
    return 'orange'
  }

  return 'red'
}

function getOrpStatus(orp) {
  if (!orp) {
    return ''
  }

  if (orp >= 650 && orp <= 750) {
    return 'green'
  }

  if ((orp > 750 && orp < 800) || (orp < 650 && orp > 600)) {
    return 'orange'
  }

  return 'red'
}

function getTemperatureStatus(temp) {
  if (!temp) {
    return ''
  }

  if (temp < 4 || temp > 34) {
    return 'red'
  }

  if (temp < 12 || temp > 32) {
    return 'orange'
  }

  return 'green'
}

let defrostSince = null
const MINIMUM_DEFROST_DURATION = 5 * 60 * 1000

async function frostProtectionLoop() {
  const {circulation, temperature} = await getStatus()
  if (temperature < 4 && circulation === 'inactive') {
    await Circulation.start()
    console.log('   --- Hors-gel : circulation lancée ---')
    defrostSince = new Date()
  } else if (defrostSince && (new Date() - defrostSince > MINIMUM_DEFROST_DURATION) && temperature > 6 && circulation === 'active') {
    await Circulation.stop()
    console.log('   --- Hors-gel : circulation arrêtée ---')
    defrostSince = null
  } else if (defrostSince && circulation === 'inactive') {
    defrostSince = null
  }
}

async function main() {
  await initBus()
  await Circulation.init()
  await Temperature.init()

  if (DISABLE_ORP !== '1') {
    await Orp.init()
  }

  if (DISABLE_PH !== '1') {
    await Ph.init()
  }

  await printStatus()

  setInterval(async () => {
    await printStatus()

    if (FROST_PROTECTION_MODE === '1') {
      await frostProtectionLoop()
    }
  }, 60 * 1000) // Every minute

  const app = express()

  app.use(morgan('dev'))

  app.get(`/${SHELLY_ACTIONS_KEY}/circulation-webhook/active`, (req, res) => {
    Circulation.updateStatus('active')
    res.sendStatus(200)
  })

  app.get(`/${SHELLY_ACTIONS_KEY}/circulation-webhook/inactive`, (req, res) => {
    Circulation.updateStatus('inactive')
    res.sendStatus(200)
  })

  app.get('/', w(async (req, res) => {
    const {orp, ph, temperature, circulation} = await getStatus()
    res.send(`<html>
<head>
  <title>Piscine</title>
  <style>
    body {padding: 1em; font-family: Helvetica;}
    .red {color: red;}
    .orange {color: orange;}
    .green {color: green;}
  </style>
</head>
<body>
  Circulation : ${circulation}<br />
  Température : <span class="${getTemperatureStatus(temperature)}">${temperature.toFixed(1)}°C</span><br />
  pH : <span class="${getPHStatus(ph)}">${ph ? ph.toFixed(2) : 'N/A'}</span><br />
  ORP : <span class="${getOrpStatus(orp)}">${orp ? orp.toFixed(2) : 'N/A'} mV</span>
</body>
</html>`)
  }))

  app.listen(process.env.PORT || 5000)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
