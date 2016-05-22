'use strict'

const config   = require('config')
const hafas    = require('vbb-hafas')
const stations = require('vbb-stations')
const distance = require('gps-distance')

const render = require('./render')



const deps = (id, when) =>
	hafas.departures(config.vbbKey, id, {results: 5, when})

const closest = (lat, lon, r, n) => new Promise((yay, nay) => {
	// todo: use hifo
	r /= 1000
	const results = []
	stations('all')
	.on('data', (s) => {
		const d = distance(lat, lon, s.latitude, s.longitude)
		if (d <= r) results.push(Object.assign(s, {distance: d}))
	})
	.on('end', () => yay(results
		.sort((a, b) => a.distance - b.distance)
		.slice(0, n)))
	.on('error', nay)
})

const routes = (from, to, when) =>
	hafas.routes(config.vbbKey, from, to, {results: 3, when})



module.exports = {deps, closest, routes}
