'use strict'

const config  = require('config')
const Bot     = require('node-telegram-bot-api')
const so      = require('so')
const search  = require('vbb-find-station')

const lib     = require('./lib')
const render  = require('./lib/render')

const token = config.telegramToken
const bot = new Bot(token, {polling: true})

const log = (msg) => console.info(
	  msg.from.username
	, render.date(msg.date)
	, render.time(msg.date)
	, msg.text
)



const instructions = `\
You can use this bot to check public transport departures in Berlin & Brandenburg.

\`/a(bfahrt) <station> \` – Show the next departures.
\`/r(oute)   <a> to <b>\` – Get routes from A to B.

If you send a location, it will respond with the closest stations.
`
const help = (bot) => (msg) =>
	bot.sendMessage(msg.chat.id, instructions, {parse_mode: 'Markdown'})



const departure = (bot) => (msg, match) => so(function* (msg, match) {
	log(msg)
	const station = yield search(match[1])
	if (!station) return bot.sendMessage(msg.chat.id,
		'Could\'t find this station.')

	const deps = yield lib.deps(station.id)
	bot.sendMessage(msg.chat.id, render.deps(station, deps), {
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
	const from = yield search(matches[1])
	if (!from) return bot.sendMessage(msg.chat.id,
		'Could\'t find the first station.')
	const to = yield search(matches[2])
	if (!to) return bot.sendMessage(msg.chat.id,
		'Could\'t find the second station.')

	const routes = yield lib.routes(from.id, to.id)
	bot.sendMessage(msg.chat.id, routes
		.map((route) => render.route(from, to, route))
		.join('\n\n---\n\n')
	, {parse_mode: 'Markdown'})
})(msg).catch((err) => console.error(err.stack))



bot.onText(/\/(?:a|abfahrt) (.+)/i, departure(bot))
bot.onText(/\/(?:start|help|hilfe)/i, help(bot))
bot.onText(/\/(?:r|route) (.+) to (.+)/i, route(bot))
bot.on('message', (msg) => {
	if (!msg.text && msg.location) nearby(bot)(msg)
})
