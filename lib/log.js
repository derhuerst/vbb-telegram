'use strict'

const render = require('./render')



const log = (msg) => console.info(
	  msg.from.id || msg.chat.id
	, render.date(msg.date * 1000)
	, render.time(msg.date * 1000)
	, msg.text ||
		(msg.location ? msg.location.latitude + '|' + msg.location.latitude : '')
)

module.exports = log
