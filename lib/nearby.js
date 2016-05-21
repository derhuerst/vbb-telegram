'use strict'

const so     = require('so')

const _      = require('./index')
const render = require('./render')



const nearby = (bot) => (msg) => so(function* (msg) {
	_.log(msg)
	const lat = msg.location.latitude, lon = msg.location.longitude
	const closest = yield _.closest(lat, lon, 2000, 3)
	bot.sendMessage(msg.chat.id, render.nearby(closest), {
		parse_mode: 'Markdown'
	})
})(msg).catch((err) => console.error(err.stack))

module.exports = nearby
