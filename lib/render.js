'use strict'

const ms    = require('ms')
const table = require('columnify')



const time = (scheduled, realtime) => {
	const d = (realtime || scheduled) - Date.now()
	return (d < 0 ? '-' : ' ') + ms(Math.abs(d))
}

const dep = (dep) => ({
	  line:      dep.line._
	, when:      time(dep.when, dep.realtime)
	, direction: dep.direction
})

const deps = (deps) => '```\n' + table(deps.map(dep), {
	  direction:      {maxWidth: 20}
	, columns:        ['when', 'line', 'direction']
	, showHeaders:    false
	, columnSplitter: '  '
}) + '\n```'
}) + '\n```'



module.exports = {time, dep, deps}
