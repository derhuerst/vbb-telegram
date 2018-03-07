'use strict'

const Bot = require('telegraf')

const logging = require('./lib/logging')
const storage = require('./lib/storage')
const command = require('./lib/command')

const TOKEN = process.env.TOKEN
if (!TOKEN) {
	console.error('Missing TOKEN env var.')
	process.exit(1)
}

const bot = new Bot(TOKEN)
bot.use(logging)
bot.use(command)

bot.startPolling() // todo: web hook
