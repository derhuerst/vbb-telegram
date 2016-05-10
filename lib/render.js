'use strict'

const ms     = require('ms')
const table  = require('columnify')
const moment = require('moment-timezone')



const relative = (scheduled, realtime) => {
	const d = (realtime || scheduled) - Date.now()
	return (d < 0 ? '-' : ' ') + ms(Math.abs(d))
}

const distance = (km) => Math.round(km * 1000) + 'm'

const dep = (dep) => ({
	  line:      dep.line._
	, when:      relative(dep.when, dep.realtime)
	, direction: dep.direction
})

const deps = (station, deps) =>
	  `Departures for ${station.name}\n`
	+ '```\n'
	+ table(deps.map(dep), {
		  direction:      {maxWidth: 20}
		, columns:        ['when', 'line', 'direction']
		, showHeaders:    false
		, columnSplitter: '  '
	})
	+ '\n```'

const nearby = (stations) => '```\n' + table(stations
	.map((s) => ({distance: distance(s.distance), name: s.name})), {
	  columns:        ['distance', 'name']
	, showHeaders:    false
	, columnSplitter: '  '
}) + '\n```'



const time = (when) => moment(when).tz('Europe/Berlin').format('LT')

const part = (acc, part, i, parts) => {
	const travel = part.end - part.start
	acc += `\n${time(part.start)} – *${part.from.name}*`

	acc += part.transport === 'public'
		? `\nwith *${part.line._}* to *${part.direction}* for ${ms(travel)}`
		: `\n*${part.transport}* for ${ms(travel)}`

	if (i === parts.length - 1) acc += `\n${time(part.end)} – *${part.to.name}*`
	return acc
}

const route = (from, to, route) =>
	  `From ${from.name} to ${to.name} in ${ms(route.duration)}.\n`
	+ route.parts.reduce(part, '')



module.exports = {
	relative, distance, dep, deps,
	nearby,
	time, part, route
}
