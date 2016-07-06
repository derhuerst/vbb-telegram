'use strict'

const keys = [
	  {text: '/a Show departures at a station'}
	, {text: '/r Get routes from A to B.'}
	, {text: '/n Show stations around.'}
]



// todo: store in Redis
const state = {} // by user id

const context = (bot, id) => {

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
		return Promise.resolve(null)
	}

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
