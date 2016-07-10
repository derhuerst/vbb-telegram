'use strict'

const config  = require('config')
const Bot     = require('node-telegram-bot-api')
const so      = require('so')

const _       = require('./lib/index')
const render  = require('./lib/render')
const context = require('./lib/context')

const commands = {
	  help:       require('./lib/help')
	, departures: require('./lib/departures')
	, routes:     require('./lib/routes')
	, nearby:     require('./lib/nearby')
}



const log = (msg) => console.info(
	  msg.from.id
	, render.date(msg.date * 1000)
	, render.time(msg.date * 1000)
	, msg.text
		? msg.text
	  	: msg.location
	  		? msg.location.latitude + '|' + msg.location.latitude
	  		: ''
)

const parseCommand = (msg) => {
	if ('string' !== typeof msg.text) return null
	const t = msg.text.trim()
	if (t[0] !== '/') return null
	if (/^\/(?:a|abfahrt)/i.test(t))		return 'departures'
	else if (/^\/(?:r|route)/i.test(t))		return 'routes'
	else if (/^\/(?:n|nearby)/i.test(t))	return 'nearby'
	else if (/^\/(?:h|help)/i.test(t))		return 'help'
}



const token = config.telegramToken
const bot = new Bot(token, {polling: true})

bot.on('message', so(function* (msg) {
	log(msg)
	const id = msg.from ? msg.from.id : msg.chat.id
	const ctx = context(bot, id)

	let command = parseCommand(msg)
	if (command) {
		yield ctx.done()
		yield ctx.set('command', command)
		command = commands[command]
	} else
		command = commands[yield ctx.get('command')]

	if (!command) command = commands.help

	try { yield command(ctx, msg) }
	catch (e) {
		console.error(e.stack)
		ctx.done()
		ctx.keyboard(`\
*Oh snap! An error occured.*
Report this to my creator @derhuerst to help making this bot better.`, ctx.keys)
	}
}))
