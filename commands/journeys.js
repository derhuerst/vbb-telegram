'use strict'

const commandsKeyboard = require('../lib/commands-keyboard')

const journeys = async (ctx, next) => {
	await ctx.replyWithMarkdown('`journeys` command', commandsKeyboard)
	// todo
	next()
}

module.exports = journeys
