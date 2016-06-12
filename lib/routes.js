'use strict'

const so     = require('so')
const time   = require('parse-messy-time')

const _      = require('./index')
const render = require('./render')



const unknownLocation = `\
I don't know about this location, please double-check for typos.
If you're sure it's my fault, please let my creator @derhuerst know.`
const textOrLocation = `\
Please enter a location like "U mehringdamm", "Kaiserdamm 26" or send your location.`

const currentLocation = (msg) => ({
	type: 'address', name: 'your location',
	latitude: msg.location.latitude,
	longitude: msg.location.longitude
})

const routes = so(function* (ctx, msg) {
	const state = yield ctx.get('state')

	if (state === 'time') {
		if (!msg.text) return ctx.message(`Please enter text.`)
		const from = yield ctx.get('from')
		const to = yield ctx.get('to')
		const when = time(msg.text)
		ctx.typing()
		const routes = yield _.routes(from, to, when)
		yield ctx.keyboard(render.routes(routes), ctx.keys)
		yield ctx.done()
	}

	else if (state === 'to') {
		ctx.typing()
		let location
		if (msg.text) {
			location = yield _.location(msg.text)
			if (!location) return ctx.message(unknownLocation)
		} else if (msg.location) location = currentLocation(msg)
		else return ctx.message(textOrLocation)
		yield ctx.set('to', location)
		yield ctx.set('state', 'time')
		yield ctx.message(`\
*When?*
e.g. "now", "in 10 minutes" or "tomorrow 17:20"`)
	}

	else if (state === 'from') {
		ctx.typing()
		let location
		if (msg.text) {
			location = yield _.location(msg.text)
			if (!location) return ctx.message(unknownLocation)
		} else if (msg.location) location = currentLocation(msg)
		else return ctx.message(textOrLocation)
		yield ctx.set('from', location)
		yield ctx.set('state', 'to')
		yield ctx.requestLocation(`\
*Where do you want to go?*`, 'send location')
	}

	else {
		yield ctx.set('state', 'from')
		yield ctx.requestLocation(`\
*Where do you start?*
Enter a location like "U mehringdamm", "Kaiserdamm 26" or send your location.`, 'send location')
	}

})

module.exports = routes
