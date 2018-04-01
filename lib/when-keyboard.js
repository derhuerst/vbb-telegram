'use strict'

const Markup = require('telegraf/markup')

const keys = ['now', 'in 10 min', 'in 1 hour']

const getWhenKeyboard = (group) => {
	let k = keys
	return Markup.keyboard(k).selective(true).extra()
}

module.exports = getWhenKeyboard
