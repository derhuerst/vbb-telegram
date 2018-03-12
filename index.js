'use strict'

const path = require('path')
const Bot = require('telegraf')
const url = require('url')

const logging = require('./lib/logging')
const session = require('./lib/session')
const storage = require('./lib/storage')
const command = require('./lib/command')

const help = require('./commands/help')
const departures = require('./commands/departures')
const journeys = require('./commands/journeys')
const nearby = require('./commands/nearby')

const commands = {
	help, h: help,
	abfahrt: departures, a: departures,
	route: journeys, r: journeys,
	nearby, n: nearby
}

const TOKEN = process.env.TOKEN
if (!TOKEN) {
	console.error('Missing TOKEN env var.')
	process.exit(1)
}

const pathToDb = path.join(__dirname, 'vbb-telegram.ldb')

const bot = new Bot(TOKEN)
bot.use(logging)
bot.use(session(pathToDb))
bot.use(command)
bot.use(storage)
bot.use((ctx, next) => {
	if (!ctx.message) return next()
	const cmd = ctx.command || ctx.prevCommand || 'help'
	ctx.storage.getData = ctx.storage.createGetData(cmd)
	ctx.storage.putData = ctx.storage.createPutData(cmd)
	const handler = commands[cmd] || commands.help
	return handler(ctx, next)
})

if (process.env.NODE_ENV === 'dev') {
	bot.startPolling()
} else {
	const WEB_HOOK_HOST = process.env.WEB_HOOK_HOST
	if (!WEB_HOOK_HOST) {
		console.error('Missing WEB_HOOK_HOST env var.')
		process.exit(1)
	}
	const WEB_HOOK_PATH = process.env.WEB_HOOK_PATH
	if (!WEB_HOOK_PATH) {
		console.error('Missing WEB_HOOK_PATH env var.')
		process.exit(1)
	}
	const WEB_HOOK_PORT = process.env.WEB_HOOK_PORT && parseInt(process.env.WEB_HOOK_PORT)
	if (!WEB_HOOK_PORT) {
		console.error('Missing WEB_HOOK_PORT env var.')
		process.exit(1)
	}

	bot.telegram.setWebhook(url.format({
		protocol: 'https',
		host: WEB_HOOK_HOST,
		pathname: WEB_HOOK_PATH
	}))
	bot.startWebhook(WEB_HOOK_PATH, null, WEB_HOOK_PORT)
}
