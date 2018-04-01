'use strict'

const stations = require('vbb-stations/simple')
const Markup = require('telegraf/markup')

const HANDLE = process.env.HANDLE
if (!HANDLE) {
	console.error('Missing HANDLE env var.')
	process.exit(1)
}

const mention = ('@' + HANDLE).toLowerCase()

const namesById = Object.create(null)
for (let station of stations) namesById[station.id] = station.name

const getFrequentStationsKeyboard = (ids, group, reqLocation) => {
	const keys = []
	if (reqLocation && !group) {
		keys.push(Markup.locationRequestButton('use current location'))
	}
	for (let id of ids) {
		if (id in namesById) {
			let name = namesById[id]
			if (group) name = mention + ' ' + name
			keys.push(Markup.button(name))
		}
	}
	return Markup.keyboard(keys).selective(true).extra()
}

module.exports = getFrequentStationsKeyboard
