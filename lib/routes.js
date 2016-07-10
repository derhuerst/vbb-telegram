'use strict'

const so     = require('so')
const time   = require('parse-messy-time')
const hash = require('shorthash').unique

const _      = require('./index')
const render = require('./render')



const when = so(function* (ctx, msg) {
	if (!msg.text) return ctx.message(`Please enter text.`)
	const from = yield ctx.get('origin')
	const to = yield ctx.get('destination')
	const when = time(msg.text)
	ctx.typing()
	const routes = yield _.routes(from, to, when)
	yield ctx.keyboard(render.routes(routes), ctx.keys)
})



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

const where = so(function* (key, ctx, msg) {
	ctx.typing()
	let location
	if (msg.text) {
		location = yield _.location(msg.text)
		if (!location) return ctx.message(unknownLocation)

		const id = location.id || hash(location.name)
		ctx.frequent.count(id, location.name)

	} else if (msg.location) location = currentLocation(msg)
	else return ctx.message(textOrLocation)
	yield ctx.set(key, location)
})



const promptWhen = `\
*When?*
e.g. "now", "in 10 minutes" or "tomorrow 17:20"`
const promptDestination = `\
*Where do you want to go?*`
const promptOrigin = `\
*Where do you start?*
Enter a location like "U mehringdamm", "Kaiserdamm 26" or send your location.`

const requestLocation = [{text: 'send location', request_location: true}]
const frequent = (ctx) =>
	ctx.frequent.get(3)
	.then((freq) => freq
		.map((f) => ({text: f.text}))
		.concat(requestLocation),
	(e) => {throw e})

const routes = so(function* (ctx, msg) {
	const state = yield ctx.get('state')

	if (state === 'when') {
		yield when(ctx, msg)
		yield ctx.done()
	}
	else if (state === 'destination') {
		yield where('destination', ctx, msg)
		yield ctx.set('state', 'when')
		yield ctx.message(promptWhen)
	}
	else if (state === 'origin') {
		yield where('origin', ctx, msg)
		yield ctx.set('state', 'destination')
		yield ctx.keyboard(promptDestination, yield frequent(ctx))
	}
	else {
		yield ctx.set('state', 'origin')
		yield ctx.keyboard(promptOrigin, yield frequent(ctx))
	}
})

module.exports = routes
