'use strict'

const Bot = require('telegraf')

const logging = require('./lib/logging')
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

const bot = new Bot(TOKEN)
bot.use(logging)
bot.use(command)
bot.use((ctx, next) => {
	if (!ctx.message) return next()
	const cmd = ctx.state.cmd || ctx.state.prevCmd || 'help'
	const handler = commands[cmd] || commands.help

	const chat = ctx.message.chat.id
	ctx.getData = storage.createGetData(chat, cmd)
	ctx.putData = storage.createPutData(chat, cmd)
	return handler(ctx, next)
})

bot.startPolling() // todo: web hook
