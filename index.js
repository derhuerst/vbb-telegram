'use strict'

const config  = require('config')
const Api     = require('node-telegram-bot-api')
const so      = require('so')

const log = require('./lib/log')
const namespace = require('./lib/namespace')
const state = require('./lib/state')
const context = require('./lib/context')

const handlers = {
	  help:       require('./commands/help')
	, departures: require('./commands/departures')
	, routes:     require('./commands/routes')
	, nearby:     require('./commands/nearby')
}



const parseCmd = (msg) => {
	if ('string' !== typeof msg.text) return null
	const t = msg.text.trim()
	if (t[0] !== '/') return null
	if (/^\/(?:a|abfahrt)/i.test(t))		return 'departures'
	else if (/^\/(?:r|route)/i.test(t))		return 'routes'
	else if (/^\/(?:n|nearby)/i.test(t))	return 'nearby'
	else if (/^\/(?:h|help)/i.test(t))		return 'help'
}

const error = `\
*Oh snap! An error occured.*
Report this to my creator @derhuerst to help making this bot better.`



const api = new Api(config.telegramToken, {polling: true})

api.on('message', so(function* (msg) {
	log(msg)
	const user = msg.from ? msg.from.id : msg.chat.id

	const data = namespace(user, 'data')
	const command = state(user, 'cmd')
	const ctx = context(api, user)

	let parsed = parseCmd(msg), handler
	if (parsed) {
		yield command.set(parsed)
		yield data.clear()
		handler = handlers[parsed]
	} else handler = handlers[yield command()]

	if (!handler) handler = handlers.help

	try {
		yield handler(ctx, data, msg)
	} catch (e) {
		console.error(e.stack)
		data.clear()
		ctx.keyboard(error, ctx.commands)
	}
}))
