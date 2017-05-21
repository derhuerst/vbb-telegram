'use strict'

const so = require('so')
const search = require('vbb-find-station')
const client = require('vbb-client')

// todo: query.identifier = 'vbb-telegram'

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
