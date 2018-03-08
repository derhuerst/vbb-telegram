'use strict'

const stations = require('vbb-stations/simple')
const Markup = require('telegraf/markup')

const namesById = Object.create(null)
for (let station of stations) namesById[station.id] = station.name

const getFrequentStationsKeyboard = (ids, keys = []) => {
	for (let id of ids) {
		if (id in namesById) keys.push(Markup.button(namesById[id]))
	}
	return Markup.keyboard(keys).extra()
}

module.exports = getFrequentStationsKeyboard
