'use strict'

const stations = require('vbb-stations/simple')
const Markup = require('telegraf/markup')

const namesById = Object.create(null)
for (let station of stations) namesById[station.id] = station.name

const getFrequentStationsKeyboard = (ids) => {
	const keys = []
	for (let id of ids) {
		if (id in namesById) keys.push(namesById[id])
	}
	return Markup.keyboard(keys).oneTime().extra()
}

module.exports = getFrequentStationsKeyboard
