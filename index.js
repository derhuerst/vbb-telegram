'use strict'

const config  = require('config')
const Api     = require('node-telegram-bot-api')
const so      = require('so')

const log = require('./lib/log')
const namespace = require('./lib/namespace')
const context = require('./lib/context')
const storage = require('./lib/storage')
const state = require('./lib/state')

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

	const ns = namespace(storage, user)
	const cmd = state(ns, 'cmd')

	const previousCmd = yield cmd()
	const parsedCmd = parseCmd(msg)
	let command, newThread = false

	if (parsedCmd) {
		command = parsedCmd
		if (parsedCmd !== previousCmd) yield cmd.set(command)
		if (parsedCmd) newThread = true
	} else {
		if (previousCmd) command = previousCmd
		else {
			command = 'help'
			newThread = true
			yield cmd.set(command)
		}
	}

	const keep = namespace(ns, command + ':keep')
	const tmp = namespace(ns, command + ':tmp')
	if (parsedCmd) yield tmp.clear()
	const ctx = context(api, user)

	try {
		yield handlers[command](ctx, newThread, keep, tmp, msg)
	} catch (e) {
		console.error(e.stack)
		yield tmp.clear()
		yield cmd.set(null)
		ctx.keyboard(error, ctx.commands)
	}
}))
