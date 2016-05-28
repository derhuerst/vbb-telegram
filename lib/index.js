'use strict'

const config   = require('config')
const hafas    = require('vbb-hafas')

const render = require('./render')



const deps = (id, when) =>
	hafas.departures(config.vbbKey, id, {results: 5, when})

const closest = (lat, long, n) =>
	hafas.nearby(lat, long, {results: n})

const routes = (from, to, when) =>
	hafas.routes(config.vbbKey, from, to, {results: 3, when})



module.exports = {deps, closest, routes}
