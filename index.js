'use strict'

const config  = require('config')
const Bot     = require('node-telegram-bot-api')

const _       = require('./lib/index')
const render  = require('./lib/render')

const departures = require('./lib/departures')
const routes = require('./lib/routes')
const nearby = require('./lib/nearby')



const token = config.telegramToken
const bot = new Bot(token, {polling: true})

const instructions = `\
You can use this bot to check public transport departures in Berlin & Brandenburg.

\`/a(bfahrt) <station> \` – Show the next departures.
\`/r(oute)   <a> to <b>\` – Get routes from A to B.

If you send a location, it will respond with the closest stations.
`
const help = (msg) =>
	bot.sendMessage(msg.chat.id, instructions, {parse_mode: 'Markdown'})

bot.onText(/\/(?:a|abfahrt) (.+)/i, departures(bot))
bot.onText(/\/(?:start|help|hilfe)/i, help)
bot.onText(/\/(?:r|route) (.+) to (.+)/i, routes(bot))
bot.on('message', (msg) => {
	if (!msg.text && msg.location) nearby(bot)(msg)
})
