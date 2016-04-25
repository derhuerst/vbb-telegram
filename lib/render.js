'use strict'

const ms    = require('ms')
const table = require('columnify')
const moment   = require('moment')



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



const time = (when) => moment(when).format('LT')

const part = (acc, part, i, parts) => {
	const wait = i > 0 ? part.start - parts[i - 1].end : 0
	const travel = part.end - part.start

	if (i > 0) acc.push({
		  first:  (part.line ? part.line._ : '')
		, second: ' -> ' + part.direction
		, third:  ms(travel)
	})
	acc.push({
		  first:  time(part.start)
		, second: part.from.name
		, third:  wait > 0 ? ms(wait) + ' waiting' : ''
	})
	return acc
}

const route = (from, to, route) =>
	  '```\n'
	+ table(route.parts.reduce(part, []), {
		  showHeaders:    false
		, columnSplitter: '  '
	})
	+ '\n```'



module.exports = {
	relative, distance, dep, deps,
	nearby,
	time, part, route
}
