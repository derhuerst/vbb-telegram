'use strict'

const stations = require('vbb-stations/simple')
const Markup = require('telegraf/markup')

const namesById = Object.create(null)
for (let station of stations) namesById[station.id] = station.name

const getFrequentStationsKeyboard = (ids, reqLocation) => {
	const keys = []
	if (reqLocation) {
		keys.push(Markup.locationRequestButton('use current location'))
	}
	for (let id of ids) {
		if (id in namesById) {
			const name = namesById[id]
			keys.push(Markup.button(name))
		}
	}
	return Markup.keyboard(keys).selective(true).extra()
}

module.exports = getFrequentStationsKeyboard
