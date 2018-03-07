'use strict'

const stringWidth = require('string-width')

const renderTimeLeft = require('../../lib/render-time-left')

const SPACING = '  '

const renderDeps = (deps) => {
	const rows = []
	const widths = []
	const maxWidth = [0, 0, 0]

	for (let dep of deps) {
		// todo: show delay
		const line = dep.line.name
		const time = renderTimeLeft(new Date(dep.when) - Date.now())
		const dir = dep.direction

		rows.push([line, time, dir])
		const width = [stringWidth(line), stringWidth(time), stringWidth(dir)]
		widths.push(width)
		maxWidth[0] = Math.max(width[0], maxWidth[0])
		maxWidth[1] = Math.max(width[1], maxWidth[1])
		maxWidth[2] = Math.max(width[2], maxWidth[2])
	}

	// render table
	let str = '```'
	for (let i = 0; i < rows.length; i++) {
		const row = rows[i]
		str += '\n'
		for (let j = 0; j < 3; j++) {
			str += row[j] + SPACING
			if (j !== 2) str += ' '.repeat(maxWidth[j] - widths[i][j])
		}
	}
	str += '\n```'

	return str
}

module.exports = renderDeps
