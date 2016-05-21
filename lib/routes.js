'use strict'

const so     = require('so')
const search = require('vbb-find-station')

const _      = require('./index')
const render = require('./render')



const route = (bot) => (msg, matches) => so(function* (msg) {
	_.log(msg)
	const from = yield search(matches[1])
	if (!from) return bot.sendMessage(msg.chat.id,
		'Could\'t find the first station.')
	const to = yield search(matches[2])
	if (!to) return bot.sendMessage(msg.chat.id,
		'Could\'t find the second station.')

	const routes = yield _.routes(from.id, to.id)
	bot.sendMessage(msg.chat.id, routes
		.map((route) => render.route(from, to, route))
		.join('\n\n---\n\n')
	, {parse_mode: 'Markdown'})
})(msg).catch((err) => console.error(err.stack))

module.exports = route
