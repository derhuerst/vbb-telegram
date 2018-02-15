'use strict'

const api = require('../lib/api')
const render = require('../lib/render')



const locationOnly = `Please send a location, other stuff is not supported yet.`

const promptLocation = `Please share your location with me.`



const location = async (ctx, msg) => {
	if (!msg.location) return ctx.message(locationOnly)

	const lat  = msg.location.latitude
	const long = msg.location.longitude
	await ctx.typing()
	const closest = await api.closest(lat, long, 3)

	const buttons = [
		{text: '/h\u2063 back to start'}
	].concat(closest.map((station) => ({
		text: `/a ${station.name}\u2063– departures`
	})))

	for (let station of closest) {
		await ctx.location(station.location.latitude, station.location.longitude)
		await ctx.keyboard(render.nearby(station), buttons)
	}
}



const nearby = async (ctx, newThread, keep, tmp, msg) => {
	const state = await tmp.get('state')
	if (state === 'location') {
		await location(ctx, msg)
		await tmp.clear()
	} else {
		await tmp.set('state', 'location')
		await ctx.requestLocation(promptLocation, 'send location')
	}
}

module.exports = nearby
