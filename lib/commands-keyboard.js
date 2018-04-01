'use strict'

const Markup = require('telegraf/markup')

const keys = [
	['/a', 'Show departures at a station.'],
	['/r', 'Get routes from A to B.'],
	['/n', 'Show stations around your location.']
]

const getCommandsKeyboard = () => {
	const k = keys.map(key => key.join('\u2063 '))
	return Markup.keyboard(k).oneTime().selective(true).extra()
}

module.exports = getCommandsKeyboard
