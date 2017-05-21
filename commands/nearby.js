'use strict'

const so     = require('so')

const api = require('../lib/api')
const render = require('../lib/render')



const locationOnly = `Please send a location, other stuff is not supported yet.`

const promptLocation = `Please share your location with me.`



const location = so(function* (ctx, msg) {
	if (!msg.location) return ctx.message(locationOnly)

	const lat  = msg.location.latitude
	const long = msg.location.longitude
	yield ctx.typing()
	const closest = yield api.closest(lat, long, 3)

	const buttons = [
		{text: '/h\u2063 back to start'}
	].concat(closest.map((station) => ({
		text: `/a ${station.name}\u2063– departures`
	})))

	for (let station of closest) {
		yield ctx.location(station.coordinates.latitude, station.coordinates.longitude)
		yield ctx.keyboard(render.nearby(station), buttons)
	}
})



const nearby = so(function* (ctx, newThread, keep, tmp, msg) {
	const state = yield tmp.get('state')
	if (state === 'location') {
		yield location(ctx, msg)
		yield tmp.clear()
	} else {
		yield tmp.set('state', 'location')
		yield ctx.requestLocation(promptLocation, 'send location')
	}
})

module.exports = nearby
