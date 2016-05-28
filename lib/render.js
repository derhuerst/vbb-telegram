'use strict'

const ms       = require('ms')
const linesAt  = require('vbb-lines-at')
const table    = require('columnify')
const moment   = require('moment')
const timezone = require('moment-timezone')
const shorten  = require('vbb-short-station-name')



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
	  line:      dep.line._
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



const time = (when) => timezone(when).tz('Europe/Berlin').format('LT')
const date = (when) => timezone(when).tz('Europe/Berlin').format('l')

const part = (acc, part, i, parts) => {
	const travel = part.end - part.start
	acc += `\n${time(part.start)} – *${shorten(part.from.name)}*`

	acc += part.transport === 'public'
		? `\nwith *${part.line._}* to *${part.direction}* for ${ms(travel)}`
		: `\n*${part.transport}* for ${ms(travel)}`

	if (i === parts.length - 1)
		acc += `\n${time(part.end)} – *${shorten(part.to.name)}*`
	return acc
}

const coords = (xy) => `\`${xy[0]}\`|\`${xy[1]}\``

const route = (from, to, route) =>
	  'From ' + (from.name ? shorten(from.name) : coords(from))
	+ ' to ' + (to.name ? shorten(to.name) : coords(to))
	+ ` in ${ms(route.duration)}.\n`
	+ route.parts.reduce(part, '')

const routes = (from, to, routes) => routes
	.map((r) => route(from, to, r))
	.join('\n\n---\n\n')



module.exports = {
	relative, dep, deps,
	nearby,
	time, date, part, route, routes
}
