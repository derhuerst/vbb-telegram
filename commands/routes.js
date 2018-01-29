'use strict'

const time   = require('parse-messy-time')
const hash = require('shorthash').unique

const api = require('../lib/api')
const render = require('../lib/render')
const frequent = require('../lib/frequent')



const textOnly = `Please enter text.`

const unknownLocation = `\
I don't know about this location, please double-check for typos.
If you're sure it's my fault, please let my creator @derhuerst know.`

const foundLocation = (l) => `\
I found ${l.name}.`

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



const when = async (ctx, data, msg) => {
	if (!msg.text) return ctx.message(textOnly)
	const when = time(msg.text)

	const from = await data.get('origin')
	const to = await data.get('destination')
	ctx.typing()
	const routes = await api.routes(from, to, when)

	await ctx.keyboard(render.routes(routes), ctx.commands)
}



const currentLocation = (msg) => ({
	type: 'address', name: 'your location',
	latitude: msg.location.latitude,
	longitude: msg.location.longitude
})

const where = async (key, ctx, data, freq, msg) => {
	ctx.typing()
	let location
	if (msg.text) {
		location = await api.location(msg.text)
		if (!location) return ctx.message(unknownLocation)
		else ctx.message(foundLocation(location))

		const id = location.id || hash(location.name)
		freq.inc(id, location.name)

	} else if (msg.location) location = currentLocation(msg)
	else return ctx.message(textOrLocation)
	await data.set(key, location)
}



const requestLocation = [{text: 'send location', request_location: true}]
const frequentLocations = async (freq) => {
	let locations = await freq(3)
	locations = locations.map((text) => ({text}))
	return locations.concat(requestLocation)
}

const routes = async (ctx, newThread, keep, tmp, msg) => {
	const freq = frequent(keep, 'freq')

	const state = await tmp.get('state')
	if (state === 'when') {
		await when(ctx, tmp, msg)
		await tmp.clear()
	}
	else if (state === 'destination') {
		await where('destination', ctx, tmp, freq, msg)
		await tmp.set('state', 'when')
		await ctx.keyboard(promptWhen, whenButtons)
	}
	else if (state === 'origin') {
		await where('origin', ctx, tmp, freq, msg)
		await tmp.set('state', 'destination')
		await ctx.keyboard(promptDestination, await frequentLocations(freq))
	}
	else {
		await tmp.set('state', 'origin')
		await ctx.keyboard(promptOrigin, await frequentLocations(freq))
	}
}

module.exports = routes
