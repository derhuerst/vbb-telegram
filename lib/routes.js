'use strict'

const so     = require('so')
const time   = require('parse-messy-time')
const search = require('vbb-find-station')

const _      = require('./index')
const render = require('./render')



const unknownStation = `\
I don't know about this station, please double-check for typos.
If you're sure it's my fault, please let my creator @derhuerst know.`

const routes = so(function* (ctx, msg) {
	if (!msg.text) return ctx.message(`\
Please enter text, other stuff is not supported yet.`)
	const state = yield ctx.get('state')

	if (state === 'time') {
		const from = yield ctx.get('from')
		const to = yield ctx.get('to')
		const when = time(msg.text)
		ctx.typing()
		const routes = yield _.routes(from.id, to.id, when)
		yield ctx.keyboard(render.routes(from, to, routes), ctx.keys)
		yield ctx.done()
	}

	else if (state === 'to') {
		ctx.typing()
		const station = yield search(msg.text)
		if (!station) return ctx.message(unknownStation)
		yield ctx.set('to', station)
		yield ctx.set('state', 'time')
		yield ctx.message(`\
*When?*
Enter something like "in 10 minutes" or "tomorrow 6pm".`)
	}

	else if (state === 'from') {
		ctx.typing()
		const station = yield search(msg.text)
		if (!station) return ctx.message(unknownStation)
		yield ctx.set('from', station)
		yield ctx.set('state', 'to')
		yield ctx.message(`\
*Where do you want to go?*`)
	}

	else {
		yield ctx.set('state', 'from')
		yield ctx.message(`\
*Where do you start?*
Enter a station name like "u mehringdamm" or "Kotti".`)
	}

})

module.exports = routes
