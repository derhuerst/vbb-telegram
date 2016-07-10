'use strict'

const commands = [
	  {text: '/a Show departures at a station'}
	, {text: '/r Get routes from A to B.'}
	, {text: '/n Show stations around.'}
]



const context = (api, user) => {

	const message = (text, props) =>
		api.sendMessage(user, text, Object.assign({
			parse_mode:    'Markdown',
			hide_keyboard: true
		}, props || {}))

	const keyboard = (text, keys) =>
		message(text, {
			reply_markup: JSON.stringify({
				keyboard:          keys.map((k) => [k]),
				one_time_keyboard: true
			})
		})

	const requestLocation = (text, caption) =>
		keyboard(text, [{text: caption, request_location: true}])

	const location = (lat, long) => api.sendLocation(user, lat, long)

	const typing = () => api.sendChatAction(user, 'typing')

	return {
		commands,
		message, keyboard,
		requestLocation, location,
		typing
	}
}

module.exports = context
