'use strict'

const storage = require('./storage')

const invisibleSpace = '\u2063'

const command = async (ctx, next) => {
	if (!ctx.message) return next()

	const msg = ctx.message
	const prevCmd = await storage.getCommand(msg.chat.id)
	ctx.state.prevCmd = prevCmd

	if (!Array.isArray(msg.entities)) return next()
	const entity = msg.entities.find(e => e.type === 'bot_command' && e.offset === 0)
	if (!entity) return next()
	const cmd = msg.text.substr(entity.offset, entity.length).slice(1).toLowerCase()
	ctx.state.cmd = cmd

	const argsStart = entity.offset + entity.length + 1
	if (msg.text[argsStart - 1] === invisibleSpace) ctx.state.args = []
	else ctx.state.args = msg.text.slice(argsStart).split(/\s+/)

	if (prevCmd !== cmd) await storage.putCommand(msg.chat.id, cmd)
	next()
}

module.exports = command
