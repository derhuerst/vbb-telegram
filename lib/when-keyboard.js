'use strict'

const Markup = require('telegraf/markup')

const HANDLE = process.env.HANDLE
if (!HANDLE) {
	console.error('Missing HANDLE env var.')
	process.exit(1)
}

const mention = ('@' + HANDLE).toLowerCase()

const keys = ['now', 'in 10 min', 'in 1 hour']

const getWhenKeyboard = (group) => {
	let k = keys
	if (group) {
		k = k.map(key => mention + ' ' + key)
	}
	return Markup.keyboard(k).selective(true).extra()
}

module.exports = getWhenKeyboard
