'use strict'

const so     = require('so')
const time   = require('parse-messy-time')
const hash = require('shorthash').unique

const api = require('../lib/api')
const render = require('../lib/render')
const frequent = require('../lib/frequent')



const textOnly = `Please enter text.`

const unknownLocation = `\
I don't know about this location, please double-check for typos.
If you're sure it's my fault, please let my creator @derhuerst know.`

const textOrLocation = `\
Please enter a location like "U mehringdamm", "Kaiserdamm 26" or send your location.`

const promptWhen = `\
*When?*
e.g. "now", "in 10 minutes" or "tomorrow 17:20"`
const whenButtons = [{text: 'now'}, {text: 'in 10 min'}, {text: 'in 1h'}]

const promptDestination = `\
*Where do you want to go?*`
const promptOrigin = `\
*Where do you start?*
Enter a location like "U mehringdamm", "Kaiserdamm 26" or send your location.`



const when = so(function* (ctx, data, msg) {
	if (!msg.text) return ctx.message(textOnly)
	const when = time(msg.text)

	const from = yield data.get('origin')
	const to = yield data.get('destination')
	ctx.typing()
	const routes = yield api.routes(from, to, when)

	yield ctx.keyboard(render.routes(routes), ctx.commands)
})



const currentLocation = (msg) => ({
	type: 'address', name: 'your location',
	latitude: msg.location.latitude,
	longitude: msg.location.longitude
})

const where = so(function* (key, ctx, data, freq, msg) {
	ctx.typing()
	let location
	if (msg.text) {
		location = yield api.location(msg.text)
		if (!location) return ctx.message(unknownLocation)

		const id = location.id || hash(location.name)
		freq.inc(id, location.name)

	} else if (msg.location) location = currentLocation(msg)
	else return ctx.message(textOrLocation)
	yield data.set(key, location)
})



const requestLocation = [{text: 'send location', request_location: true}]
const frequentLocations = so(function* (freq) {
	let locations = yield freq(3)
	locations = locations.map((text) => ({text}))
	return locations.concat(requestLocation)
})

const routes = so(function* (ctx, newThread, keep, tmp, msg) {
	const freq = frequent(keep, 'freq')

	const state = yield tmp.get('state')
	if (state === 'when') {
		yield when(ctx, tmp, msg)
		yield tmp.clear()
	}
	else if (state === 'destination') {
		yield where('destination', ctx, tmp, freq, msg)
		yield tmp.set('state', 'when')
		yield ctx.keyboard(promptWhen, whenButtons)
	}
	else if (state === 'origin') {
		yield where('origin', ctx, tmp, freq, msg)
		yield tmp.set('state', 'destination')
		yield ctx.keyboard(promptDestination, yield frequentLocations(freq))
	}
	else {
		yield tmp.set('state', 'origin')
		yield ctx.keyboard(promptOrigin, yield frequentLocations(freq))
	}
})

module.exports = routes
