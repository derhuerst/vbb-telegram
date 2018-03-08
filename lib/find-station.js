'use strict'

const searchStations = require('vbb-stations-autocomplete')
const allStations = require('vbb-stations/simple')

const findStation = (name) => {
	let [station] = searchStations(name, 1, false, false) // non-fuzzy
	if (!station) [station] = searchStations(name, 1, true, false) // fuzzy
	if (station) station = allStations.find(s => s.id === station.id) // get details
	return station
}

module.exports = findStation
