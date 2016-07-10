'use strict'

const so = require('so')
const search = require('vbb-find-station')
const config   = require('config')
const client = require('vbb-client')

// todo: query.identifier = 'vbb-telegram'


const location = so(function* (query) {
	let station = yield search(query)
	if (station) {
		station = station.__proto__
		station.type = 'station'
		return station
	}
	const results = yield client.locations(query, {results: 1})
	if (results.length === 0) return
	return results[0]
})

const deps = (id, when) =>
	client.departures(id, {duration: 15, when})

const closest = (lat, long, n) =>
	client.nearby({latitude: lat, longitude: long, results: n})

const routes = (from, to, when) =>
	client.routes(from, to, {results: 3, when})



module.exports = {location, deps, closest, routes}
