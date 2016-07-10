'use strict'

const so     = require('so')
const time   = require('parse-messy-time')
const search = require('vbb-find-station')

const _      = require('./index')
const render = require('./render')



const when = so(function* (ctx, msg) {
	const station = yield ctx.get('station')
	const when = time(msg.text)
	ctx.typing()
	const deps = yield _.deps(station.id, when)
	yield ctx.keyboard(render.deps(station, deps), ctx.keys)
})



const unknownStation = `\
I don't know about this station, please double-check for typos.
If you're sure it's my fault, please let my creator @derhuerst know.`

const where = so(function* (ctx, msg) {
	ctx.typing()
	const station = yield search(msg.text)
	if (!station) return ctx.message(unknownStation)
	yield ctx.set('station', station.__proto__)
})



const promptWhen = `\
*When?*
e.g. "now", "in 10 minutes" or "tomorrow 17:20"`
const promptWhere = `\
*Which station?*
Enter a station name like "u mehringdamm" or "Kotti".`

const departures = so(function* (ctx, msg) {
	if (!msg.text) return ctx.message(`\
Please enter text, other stuff is not supported yet.`)
	const state = yield ctx.get('state')

	if (state === 'when') {
		yield when(ctx, msg)
		yield ctx.done()
	} else if (state === 'where') {
		yield where(ctx, msg)
		yield ctx.set('state', 'when')
		yield ctx.message(promptWhen)
	} else {
		yield ctx.set('state', 'where')
		yield ctx.message(promptWhere)
	}
})

module.exports = departures
