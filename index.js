'use strict'

const path = require('path')
const Bot = require('telegraf')

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

bot.startPolling() // todo: web hook
