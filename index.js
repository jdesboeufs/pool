#!/usr/bin/env node
/* eslint import/no-unassigned-import: off */
import process from 'node:process'

import 'dotenv/config.js'
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

function getPHStatus(ph) {
  if (ph >= 7 && ph <= 7.4) {
    return 'green'
  }

  if ((ph > 7.4 && ph < 7.6) || (ph < 7 && ph > 6.9)) {
    return 'orange'
  }

  return 'red'
}

function getOrpStatus(orp) {
  if (orp >= 650 && orp <= 750) {
    return 'green'
  }

  if ((orp > 750 && orp < 800) || (orp < 650 && orp > 600)) {
    return 'orange'
  }

  return 'red'
}

async function main() {
  await initBus()
  await printStatus()

  setInterval(async () => {
    await printStatus()
  }, 5 * 60 * 1000)

  const app = express()

  app.get('/', w(async (req, res) => {
    const {orp, ph, temperature, circulation} = await getStatus()
    res.send(`<html>
<head>
  <title>Piscine</title>
  <style>
    .red {color: red;}
    .orange {color: orange;}
    .green {color: green;}
  </style>
</head>
<body>
  Circulation : ${circulation ? 'active' : 'inactive'}<br />
  Température : ${temperature.toFixed(1)}°C<br />
  pH : <span class="${getPHStatus(ph)}">${ph.toFixed(2)}</span><br />
  ORP : <span class="${getOrpStatus(orp)}">${orp.toFixed(2)} mV</span>
</body>
</html>`)
  }))

  app.listen(process.env.PORT || 5000)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
