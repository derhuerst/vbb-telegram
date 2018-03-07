'use strict'

const Markup = require('telegraf/markup')

const keys = [
	['/a', 'Show departures at a station.'].join('\u2063 '),
	['/r', 'Get routes from A to B.'].join('\u2063 '),
	['/n', 'Show stations around your location.'].join('\u2063 ')
]

const commandsKeyboard = Markup.keyboard(keys).oneTime().extra()

module.exports = commandsKeyboard
