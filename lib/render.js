'use strict'

const ms       = require('ms')
const linesAt  = require('vbb-lines-at')
const table    = require('columnify')
const moment   = require('moment')
const timezone = require('moment-timezone')

const TIMEZONE = process.env.TIMEZONE
if (!TIMEZONE) {
	console.error('Missing TIMEZONE env var.')
	process.exit(1)
}

const relative = (when) => {
	if (when === null) return '?'

	// todo: timezone
	const now = new Date()
	if (new Date(when).getDate() !== now.getDate()) {
		return moment(when).locale('de').format('dd, LT')
	}
	if (Math.abs(when - now) >= 3600 * 1000) {
		return moment(when).locale('de').format('LT')
	}
	const d = when - now
	return (d < 0 ? '-' : ' ') + ms(Math.abs(d))
}

const lines = (lines) => lines.map((l) => '`' + l.name + '`').join(', ')

const dep = (dep) => ({
	  line: dep.line.name
	, when: relative(dep.when)
	, direction: dep.direction
})

const deps = (station, deps) =>
	  `${station.name} ${lines(linesAt[station.id] || [])}\n`
	+ '```\n'
	+ table(deps.map(dep), {
		  direction:      {maxWidth: 20}
		, columns:        ['when', 'line', 'direction']
		, showHeaders:    false
		, columnSplitter: '  '
	})
	+ '\n```'

const nearby = (station) =>
	`${station.distance}m *${station.name}*`

const time = when => timezone(when).tz(TIMEZONE).format('LT')
const date = when => timezone(when).tz(TIMEZONE).format('l')

const part = (acc, part, i, legs) => {
	const travel = part.arrival - part.departure
	acc += `\n${time(part.departure)} – *${part.origin.name}*`

	acc += part.mode === 'walking'
		? `\n*walk* for ${ms(travel)}`
		: `\nwith *${part.line.name}* to *${part.direction}* for ${ms(travel)}`

	if (i === legs.length - 1)
		acc += `\n${time(part.arrival)} – *${part.destination.name}*`
	return acc
}

const coords = l => `\`${l.latitude}\`|\`${l.latitude}\``

const journey = (r) => {
	return 'From ' + (r.origin.name ? r.origin.name : coords(r.origin))
	+ ' to ' + (r.destination.name ? r.destination.name : coords(r.destination))
	+ ` in ${ms(r.arrival - r.departure)}.\n`
	+ r.legs.reduce(part, '')
}

const journeys = (r) => {
	return r
	.map((r) => journey(r))
	.join('\n\n---\n\n')
}

module.exports = {
	relative, dep, deps,
	nearby,
	time, date, part, journey, journeys
}
