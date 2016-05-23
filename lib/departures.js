'use strict'

const so     = require('so')
const time   = require('parse-messy-time')
const search = require('vbb-find-station')

const _      = require('./index')
const render = require('./render')



const departures = so(function* (ctx, msg) {
	if (!msg.text) return ctx.message(`\
Please enter text, other stuff is not supported yet.`)
	const state = yield ctx.get('state')

	if (state === 'time') {
		const station = yield ctx.get('station')
		const when = time(msg.text)
		ctx.typing()
		const deps = yield _.deps(station.id, when)
		yield ctx.keyboard(render.deps(station, deps), ctx.keys)
		yield ctx.done()
	}

	else if (state === 'station') {
		ctx.typing()
		const station = yield search(msg.text)
		if (!station) return ctx.message(`\
I don't know about this station, please double-check for typos.
If you're sure it's my fault, please let my creator @derhuerst know.`)
		yield ctx.set('station', station)
		yield ctx.set('state', 'time')
		yield ctx.message(`\
*When?*
Enter something like "in 10 minutes" or "tomorrow 18pm".`)
	}

	else {
		yield ctx.set('state', 'station')
		yield ctx.message(`\
*Which station?*
Enter a station name like "u mehringdamm" or "Kotti".`)
	}

})

module.exports = departures
