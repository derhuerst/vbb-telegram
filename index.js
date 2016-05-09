'use strict'

const config  = require('config')
const Bot     = require('node-telegram-bot-api')
const so      = require('so')
const station = require('vbb-stations-autocomplete')

const lib     = require('./lib')
const render  = require('./lib/render')

const token = config.telegramToken
const bot = new Bot(token, {polling: true})

const log = (msg) => console.info(
	  msg.from.username
	, new Date(msg.date).toTimeString()
	, msg.text
)



const instructions = `\
You can use this bot to check public transport departures in Berlin & Brandenburg.

\`/departure <station>\` – Show the next departures.
\`/route <a> to <b>\` – Get routes from A to B.

If you send a location, it will respond with the closest stations.
`
const help = (bot) => (msg) =>
	bot.sendMessage(msg.chat.id, instructions, {parse_mode: 'Markdown'})



const dep = (bot) => (msg, match) => so(function* (msg, match) {
	log(msg)
	const stations = station(match[1], 1)
	if (stations.length === 0) return bot.sendMessage(msg.chat.id,
		'Could\'t find this station.')

	const deps = yield lib.deps(stations[0].id)
	bot.sendMessage(msg.chat.id, render.deps(stations[0], deps), {
		parse_mode: 'Markdown'
	})
})(msg, match).catch((err) => console.error(err.stack))



const nearby = (bot) => (msg) => so(function* (msg) {
	log(msg)
	const lat = msg.location.latitude, lon = msg.location.longitude
	const closest = yield lib.closest(lat, lon, 2000, 3)
	bot.sendMessage(msg.chat.id, render.nearby(closest), {
		parse_mode: 'Markdown'
	})
})(msg).catch((err) => console.error(err.stack))



const route = (bot) => (msg, matches) => so(function* (msg) {
	log(msg)
	const from = station(matches[1], 1)[0]
	if (!from) return bot.sendMessage(msg.chat.id,
		'Could\'t find the first station.')
	const to = station(matches[2], 1)[0]
	if (!to) return bot.sendMessage(msg.chat.id,
		'Could\'t find the second station.')

	const routes = yield lib.routes(from.id, to.id)
	console.log(require('util').inspect(routes[3], {depth: null}))
	bot.sendMessage(msg.chat.id, routes
		.map((route) => render.route(from, to, route))
		.join('\n\n---\n\n')
	, {parse_mode: 'Markdown'})
})(msg).catch((err) => console.error(err.stack))



bot.onText(/\/(?:dep|departure|abfahrt) (.+)/i, dep(bot))
bot.onText(/\/(?:start|help|hilfe)/i, help(bot))
bot.onText(/\/(?:route|journey) (.+) to (.+)/i, route(bot))
bot.on('message', (msg) => {
	if (!msg.text && msg.location) nearby(bot)(msg)
})
