'use strict'

const Bot     = require('node-telegram-bot-api')
const so      = require('so')
const station = require('vbb-stations-autocomplete')

const lib     = require('./lib')
const render  = require('./lib/render')

const token = '185371201:AAFg3SWFvAduoiNFSOZ0Gul5tJVinT7r84Q'
const bot = new Bot(token, {polling: true})



const dep = (bot) => (msg, match) => so(function* (msg, match) {
	const stations = station(match[1], 1)
	if (stations.length === 0) return bot.sendMessage(msg.chat.id,
		'Could\'t find this station.')

	const deps = yield lib.deps(stations[0].id)
	bot.sendMessage(msg.chat.id, render.deps(deps), {
		parse_mode: 'Markdown'
	})
})(msg, match).catch((err) => console.error(err.stack))

bot.onText(/\/(?:dep|departure|abfahrt) (.+)/, dep(bot))
