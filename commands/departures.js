'use strict'

const commandsKeyboard = require('../lib/commands-keyboard')

const departures = async (ctx, next) => {
	await ctx.replyWithMarkdown('`departures` command', commandsKeyboard)
	// todo
	next()
}

module.exports = departures
