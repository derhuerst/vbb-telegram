'use strict'

const Markup = require('telegraf/markup')

const HANDLE = process.env.HANDLE
if (!HANDLE) {
	console.error('Missing HANDLE env var.')
	process.exit(1)
}

const mention = ('@' + HANDLE).toLowerCase()

const keys = [
	['/a', 'Show departures at a station.'],
	['/r', 'Get routes from A to B.'],
	['/n', 'Show stations around your location.']
]

const getCommandsKeyboard = (group) => {
	let k = keys
	if (group) {
		k = k.map(key => [
			key[0] + mention,
			...key.slice(1)
		])
	}
	k = k.map(key => key.join('\u2063 '))
	return Markup.keyboard(k).oneTime().selective(true).extra()
}

module.exports = getCommandsKeyboard
