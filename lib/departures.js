'use strict'

const so     = require('so')
const search = require('vbb-find-station')

const _      = require('./index')
const render = require('./render')



const departure = (bot) => (msg, match) => so(function* (msg, match) {
	_.log(msg)
	const station = yield search(match[1])
	if (!station) return bot.sendMessage(msg.chat.id,
		'Could\'t find this station.')

	const deps = yield _.deps(station.id)
	bot.sendMessage(msg.chat.id, render.deps(station, deps), {
		parse_mode: 'Markdown'
	})
})(msg, match).catch((err) => console.error(err.stack))

module.exports = departure
