'use strict'

const ms = require('ms')

const renderTimeLeft = (t) => {
	t = Math.round(t / 1000)
	if (t === 0) return 0
	return (t < 0 ? '-' : '') + ms(Math.abs(t * 1000))
}

module.exports = renderTimeLeft
