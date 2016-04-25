'use strict'

const ms    = require('ms')
const table = require('columnify')



const time = (scheduled, realtime) => {
	const d = (realtime || scheduled) - Date.now()
	return (d < 0 ? '-' : ' ') + ms(Math.abs(d))
}

const distance = (km) => Math.round(km * 1000) + 'm'

const dep = (dep) => ({
	  line:      dep.line._
	, when:      time(dep.when, dep.realtime)
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



module.exports = {time, distance, dep, deps, nearby}
