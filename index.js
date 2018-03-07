'use strict'

const Api     = require('node-telegram-bot-api')

const log = require('./lib/log')
const namespace = require('./lib/namespace')
const context = require('./lib/context')
const storage = require('./lib/storage')
const state = require('./lib/state')

const handlers = {
	  help:       require('./commands/help')
	, departures: require('./commands/departures')
	, journeys: require('./commands/journeys')
	, nearby:     require('./commands/nearby')
}

const TOKEN = process.env.TOKEN
if (!TOKEN) {
	console.error('Missing TOKEN env var.')
	process.exit(1)
}
const WEB_HOOK = process.env.WEB_HOOK
if (!WEB_HOOK) {
	console.error('Missing WEB_HOOK env var.')
	process.exit(1)
}

const parseCmd = (msg) => {
	if ('string' !== typeof msg.text) return null
	const t = msg.text.trim()
	if (t[0] !== '/') return null
	if (/^\/(?:a|abfahrt)/i.test(t))		return 'departures'
	else if (/^\/(?:r|route)/i.test(t))		return 'journeys'
	else if (/^\/(?:n|nearby)/i.test(t))	return 'nearby'
	else if (/^\/(?:h|help)/i.test(t))		return 'help'
}

const error = `\
*Oh snap! An error occured.*
Report this to my creator @derhuerst to help making this bot better.`

let api
if (process.env.NODE_ENV === 'production') {
	console.info('using ' + WEB_HOOK + ' as web hook')
	api = new Api(TOKEN, {polling: false})
	api.setWebHook(WEB_HOOK)
} else {
	console.info('using polling')
	api = new Api(TOKEN, {polling: true})
}

api.on('message', async (msg) => {
	log(msg)
	const user = msg.from ? msg.from.id : msg.chat.id

	const ns = namespace(storage, user)
	const cmd = state(ns, 'cmd')

	const previousCmd = await cmd()
	const parsedCmd = parseCmd(msg)
	let command, newThread = false

	if (parsedCmd) {
		command = parsedCmd
		if (parsedCmd !== previousCmd) await cmd.set(command)
		if (parsedCmd) newThread = true
	} else {
		if (previousCmd) command = previousCmd
		else {
			command = 'help'
			newThread = true
			await cmd.set(command)
		}
	}

	const keep = namespace(ns, command + ':keep')
	const tmp = namespace(ns, command + ':tmp')
	if (parsedCmd) await tmp.clear()
	const ctx = context(api, user)

	// remove comments
	// Unforunately, Telegram keyboard buttons can only contain one value, which is used for both a caption and as the value inserted when those buttons are pressed. Two values (a value and a caption) would be a lot more flexbible.
	// This bot circumvents this limitation by ignoring everything after the Unicode 'INVISIBLE SEPARATOR' character, which allows nice captions and parsability at the same time.
	if (msg.text && msg.text.indexOf('\u2063') >= 0)
		msg.text = msg.text.split('\u2063')[0]

	try {
		await handlers[command](ctx, newThread, keep, tmp, msg)
	} catch (e) {
		console.error(e.stack)
		await tmp.clear()
		await cmd.set(null)
		ctx.keyboard(error, ctx.commands)
	}
})
