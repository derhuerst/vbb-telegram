'use strict'

const commandsKeyboard = require('../lib/commands-keyboard')

const nearby = async (ctx, next) => {
	await ctx.replyWithMarkdown('`nearby` command', commandsKeyboard)
	// todo
	next()
}

module.exports = nearby
