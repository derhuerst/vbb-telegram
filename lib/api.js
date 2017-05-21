'use strict'

const search = require('vbb-stations-autocomplete')
const client = require('vbb-client')

const location = (query) => {
	const [station1] = search(query, 1, false, false)
	if (station1) return Promise.resolve(station1)

	const [station2] = search(query, 1, true, false) // fuzzy
	if (station2) return Promise.resolve(station2)

	return client.locations(query, {
		results: 1, identifier: 'vbb-telegram'
	})
	.then((results) => results[0] || null)
}

const deps = (id, when) =>
	client.departures(id, {
		duration: 15, when,
		identifier: 'vbb-telegram'
	})

const closest = (lat, long, n) =>
	client.nearby({
		latitude: lat, longitude: long, results: n,
		identifier: 'vbb-telegram'
	})

const routes = (from, to, when) =>
	client.journeys(from, to, {
		results: 3, when,
		identifier: 'vbb-telegram'
	})

module.exports = {location, deps, closest, routes}
