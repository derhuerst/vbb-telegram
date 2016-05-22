'use strict'

const config  = require('config')
const Bot     = require('node-telegram-bot-api')

const _       = require('./lib/index')
const render  = require('./lib/render')

const commands = {
	  help:       require('./lib/help')
	, departures: require('./lib/departures')
	, routes:     require('./lib/routes')
	, nearby:     require('./lib/nearby')
}



const log = (msg) => console.info(
	  msg.from.username
	, render.date(msg.date)
	, render.time(msg.date)
	, msg.text
		? msg.text
	  	: msg.location
	  		? msg.location.latitude + '|' + msg.location.latitude
	  		: ''
)



const token = config.telegramToken
const bot = new Bot(token, {polling: true})

// todo: store in Redis
const state = {} // by user id
const command = {} // by user id

const context = (id) => {
	const get = (key) => {
		if (!state[id]) state[id] = {}
		return Promise.resolve(state[id][key])
	}
	const set = (key, value) => {
		if (!state[id]) state[id] = {}
		state[id][key] = value
		return Promise.resolve(value)
	}
	const done = () => {
		state[id] = {}
		command[id] = null
		return Promise.resolve(null)
	}
	const message = (text, props) =>
		bot.sendMessage(id, text,
			Object.assign({parse_mode: 'Markdown'}, props || {}))
	const keyboard = (text, keys) => message(text, {
		reply_markup: JSON.stringify({
			keyboard:          keys.map((k) => [k]),
			one_time_keyboard: true
		})
	})
	const requestLocation = (text, caption) => keyboard(text,
		[{text: caption, request_location: true}])
	const typing = () => bot.sendChatAction(id, 'typing')

	return {get, set, done, message, keyboard, requestLocation, typing}
}



bot.on('message', (msg) => {
	log(msg)
	const id = msg.from ? msg.from.id : msg.chat.id
	const ctx = context(id)

	if (msg.text && msg.text[0] === '/') {
		ctx.done()
		if (/^\/(?:a|abfahrt)/i.test(msg.text))
			command[id] = commands.departures
		else if (/^\/(?:r|route)/i.test(msg.text))
			command[id] = commands.routes
		else if (/^\/(?:n|nearby)/i.test(msg.text))
			command[id] = commands.nearby
		else if (/^\/(?:help|start)/i.test(msg.text))
			command[id] = commands.help
	} else if (!command[id]) command[id] = commands.help

	command[id](ctx, msg)
	.catch((e) => {
		console.error(e.stack)
		bot.sendMessage(id, `\
*Oh snap! An error occured.*
Report this to my creator @derhuerst to help making this bot better.`)
	})
})
