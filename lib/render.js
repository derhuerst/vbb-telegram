'use strict'

const ms       = require('ms')
const linesAt  = require('vbb-lines-at')
const table    = require('columnify')
const moment   = require('moment')
const timezone = require('moment-timezone')
const shorten  = require('vbb-short-station-name')

const TIMEZONE = process.env.TIMEZONE
if (!TIMEZONE) {
	console.error('Missing TIMEZONE env var.')
	process.exit(1)
}



const relative = (scheduled, realtime) => {
	const then = realtime || scheduled
	const now  = new Date()
	if (new Date(then).getDate() !== now.getDate())
		return moment(then).locale('de').format('dd, LT')
	if (Math.abs(then - now) >= 3600 * 1000)
		return moment(then).locale('de').format('LT')
	const d = then - now
	return (d < 0 ? '-' : ' ') + ms(Math.abs(d))
}

const lines = (lines) => lines.map((l) => '`' + l.name + '`').join(', ')

const dep = (dep) => ({
	  line:      dep.product.line
	, when:      relative(dep.when, dep.realtime)
	, direction: shorten(dep.direction)
})

const deps = (station, deps) =>
	  `${shorten(station.name)} ${lines(linesAt[station.id] || [])}\n`
	+ '```\n'
	+ table(deps.map(dep), {
		  direction:      {maxWidth: 20}
		, columns:        ['when', 'line', 'direction']
		, showHeaders:    false
		, columnSplitter: '  '
	})
	+ '\n```'

const nearby = (station) =>
	`${station.distance}m *${shorten(station.name)}*`



const time = (when) => timezone(when).tz(TIMEZONE).format('LT')
const date = (when) => timezone(when).tz(TIMEZONE).format('l')

const part = (acc, part, i, parts) => {
	const travel = part.end - part.start
	acc += `\n${time(part.start)} – *${shorten(part.from.name)}*`

	acc += part.type === 'walking'
		? `\n*walk* for ${ms(travel)}`
		: `\nwith *${part.product.line}* to *${part.direction}* for ${ms(travel)}`

	if (i === parts.length - 1)
		acc += `\n${time(part.end)} – *${shorten(part.to.name)}*`
	return acc
}

const coords = (l) => `\`${l.latitude}\`|\`${l.latitude}\``

const route = (r) =>
	  'From ' + (r.from.name ? shorten(r.from.name) : coords(r.from))
	+ ' to ' + (r.to.name ? shorten(r.to.name) : coords(r.to))
	+ ` in ${ms(r.end - r.start)}.\n`
	+ r.parts.reduce(part, '')

const routes = (r) => r
	.map((r) => route(r))
	.join('\n\n---\n\n')



module.exports = {
	relative, dep, deps,
	nearby,
	time, date, part, route, routes
}
