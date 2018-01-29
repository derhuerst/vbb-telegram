'use strict'

const time   = require('parse-messy-time')
const search = require('vbb-stations-autocomplete')

const api = require('../lib/api')
const render = require('../lib/render')
const frequent = require('../lib/frequent')



const unknownStation = `\
I don't know about this station, please double-check for typos.
If you're sure it's my fault, please let my creator @derhuerst know.`

const textOnly = `Please enter text, other stuff is not supported yet.`

const promptWhen = (s) => `\
I found ${s.name}. *When?*
e.g. "now", "in 10 minutes" or "tomorrow 17:20"`
const whenButtons = [{text: 'now'}, {text: 'in 10 min'}, {text: 'in 1h'}]

const promptWhere = `\
*Which station?*
Enter a station name like "u mehringdamm" or "Kotti".`



const start = async (ctx, tmp, freq, msg) => {
	let stations = await freq(3)
	if (stations.length === 0) await ctx.message(promptWhere)
	else {
		stations = stations.map((text) => ({text}))
		await ctx.keyboard(promptWhere, stations)
	}
}



const when = async (ctx, tmp, freq, msg) => {
	const when = time(msg.text)
	const station = await tmp.get('station')

	ctx.typing()
	const deps = await api.deps(station.id, when)
	await ctx.keyboard(render.deps(station, deps), ctx.commands)
}



const where = async (ctx, tmp, freq, msg) => {
	ctx.typing()
	const [station] = search(msg.text, 1, true, false)
	if (!station) return ctx.message(unknownStation)

	await tmp.set('station', station)
	await freq.inc(station.id, station.name)

	await ctx.keyboard(promptWhen(station), whenButtons)
}



const departures = async (ctx, newThread, keep, tmp, msg) => {
	if (!msg.text) return ctx.message(textOnly)
	const freq = frequent(keep, 'freq')

	const state = await tmp.get('state')
	if (state === 'when') {
		await when(ctx, tmp, freq, msg)
		await tmp.clear()
	} else if (state === 'where') {
		await where(ctx, tmp, freq, msg)
		await tmp.set('state', 'when')
	} else {
		const arg = msg.text.match(/\/\w+\s+(.+)/i)
		if (arg && arg[1]) { // station passed directly (e.g. '/a spichernstr')
			await where(ctx, tmp, freq, {text: arg[1]})
			await tmp.set('state', 'when')
		} else {
			await start(ctx, tmp, freq, msg)
			await tmp.set('state', 'where')
		}
	}
}

module.exports = departures
