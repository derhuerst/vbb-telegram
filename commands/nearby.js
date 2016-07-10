'use strict'

const so     = require('so')

const api = require('../lib/api')
const render = require('../lib/render')



const location = so(function* (ctx, msg) {
	if (!msg.location) return ctx.message(`\
Please send a location, other stuff is not supported yet.`)
	const lat  = msg.location.latitude
	const long = msg.location.longitude
	yield ctx.typing()
	const closest = yield api.closest(lat, long, 3)
	for (let station of closest) {
		yield ctx.location(station.latitude, station.longitude)
		yield ctx.keyboard(render.nearby(station), ctx.keys)
	}
	yield ctx.done()
})



const promptLocation = `Please share your location with me.`

const nearby = so(function* (ctx, msg) {
	const state = yield ctx.get('state')

	if (state === 'location') {
		yield location(ctx, msg)
		yield ctx.done()
	}
	else {
		yield ctx.set('state', 'location')
		yield ctx.requestLocation(promptLocation, 'send location')
	}
})

module.exports = nearby
