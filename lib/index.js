'use strict'

const so = require('so')
const search = require('vbb-find-station')
const config   = require('config')
const client = require('vbb-client')

// todo: query.identifier = 'vbb-telegram'


const location = so(function* (query) {
	const station = yield search(query)
	if (station) return station.id
	const results = yield client.locations(query, {results: 1})
	if (results.length === 0) return
	if (results[0].type === 'station') return results[0].id
	return results[0]
})

const deps = (id, when) =>
	client.departures(id, {duration: 15, when})

const closest = (lat, long, n) =>
	client.nearby({latitude: lat, longitude: long, results: n})

const routes = (from, to, when) =>
	client.routes(from, to, {results: 3, when})



module.exports = {location, deps, closest, routes}
