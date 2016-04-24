'use strict'

const config  = require('config')
const hafas   = require('vbb-hafas')



const deps = (id) => hafas.departures(config.key, id, {results: 5})

const byTime = (a, b) => (a.realtime || a.when) - (b.realtime || b.when)



module.exports = {deps}
