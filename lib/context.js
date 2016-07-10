'use strict'

const Redis = require('ioredis')

const keys = [
	  {text: '/a Show departures at a station'}
	, {text: '/r Get routes from A to B.'}
	, {text: '/n Show stations around.'}
]



const redis = new Redis()
const err = (e) => {throw e}

const context = (bot, id) => {

	const get = (key) =>
		redis.get(id + ':' + key)
		.then((value) => JSON.parse(value))

	const set = (key, value) =>
		redis.set(id + ':' + key, JSON.stringify(value))

	const done = () =>
		redis.keys(id + ':*')
		.then((keys) => {
			if (keys.length > 0) return redis.del(keys)
		}, err)

	const message = (text, props) =>
		bot.sendMessage(id, text, Object.assign({
			parse_mode:    'Markdown',
			hide_keyboard: true
		}, props || {}))

	const keyboard = (text, keys) => message(text, {
		reply_markup: JSON.stringify({
			keyboard:          keys.map((k) => [k]),
			one_time_keyboard: true
		})
	})

	const requestLocation = (text, caption) => keyboard(text,
		[{text: caption, request_location: true}])
	const typing = () => bot.sendChatAction(id, 'typing')
	const location = (lat, long) => bot.sendLocation(id, lat, long)

	return {
		get, set, done,
		message, keyboard, requestLocation, typing, location,
		keys
	}
}

module.exports = context
