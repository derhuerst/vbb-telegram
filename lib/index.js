'use strict'

const config   = require('config')
const client = require('vbb-client')



const deps = (id, when) =>
	client.departures(id, {duration: 15, when})

const closest = (lat, long, n) =>
	client.nearby({latitude: lat, longitude: long, results: n})

const routes = (from, to, when) =>
	client.routes(from, to, {results: 3, when})



module.exports = {deps, closest, routes}
