'use strict'

const config   = require('config')
const hafas    = require('vbb-hafas')
const hifo     = require('hifo')
const stations = require('vbb-stations')
const distance = require('gps-distance')

const render = require('./render')



const deps = (id, when) =>
	hafas.departures(config.vbbKey, id, {results: 5, when})

const closest = (lat, long, n) => new Promise((yay, nay) => {
	const closest = hifo(hifo.lowest('distance'), n)
	stations('all')
	.on('data', (s) => {
		s.distance = distance(lat, long, s.latitude, s.longitude)
		closest.insert(s)
	})
	.on('end', () => yay(closest.data))
	.on('error', nay)
})

const routes = (from, to, when) =>
	hafas.routes(config.vbbKey, from, to, {results: 3, when})



module.exports = {deps, closest, routes}
