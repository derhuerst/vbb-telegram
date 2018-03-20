'use strict'

const {DateTime} = require('luxon')
const ms = require('ms')

const TIMEZONE = process.env.TIMEZONE
if (!TIMEZONE) {
	console.error('Missing TIMEZONE env var.')
	process.exit(1)
}
const LOCALE = process.env.LOCALE
if (!LOCALE) {
	console.error('Missing LOCALE env var.')
	process.exit(1)
}

const renderCoords = l => '`' + l.latitude + '`|`' + l.latitude + '`'

const renderTime = (when) => {
	return DateTime.fromMillis(+new Date(when), {
		locale: LOCALE,
		zone: TIMEZONE
	}).toLocaleString(DateTime.TIME_SIMPLE)
}

const renderJourney = (j) => {
	const dur = new Date(j.arrival) - new Date(j.departure)
	let str = [
		'From',
		j.origin ? j.origin.name || j.origin.address : renderCoords(j.origin),
		'to',
		j.destination ? j.destination.name || j.destination.address : renderCoords(j.destination),
		'in',
		ms(dur)
	].join(' ') + '.\n'

	for (let i = 0; i < j.legs.length; i++) {
		const leg = j.legs[i]

		// todo: emoji for line
		// todo: links/commands for origin & destination
		str += `\n${renderTime(leg.departure)} – *${leg.origin.name}*\n`

		const dur = new Date(leg.arrival) - new Date(leg.departure)
		if (leg.mode === 'walking') str += '*walk*'
		else if (leg.line) str += `with *${leg.line.name}* to *${leg.direction}*`
		else str += leg.mode
		str += ' for ' + ms(dur)

		if (i === (j.legs.length - 1)) {
			str += `\n${renderTime(leg.arrival)} – *${leg.destination.name}*`
		}
	}

	return str
}

module.exports = renderJourney
