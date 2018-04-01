'use strict'

const invisibleSpace = '\u2063'

const HANDLE = process.env.HANDLE
if (!HANDLE) {
	console.error('Missing HANDLE env var.')
	process.exit(1)
}

const mention = ('@' + HANDLE).toLowerCase()

const commandMiddleware = async (ctx, next) => {
	if (!ctx.message) return next()
	if (!ctx.session) return Promise.reject('ctx.session is missing')

	const msg = ctx.message
	ctx.prevCommand = await ctx.session.get('cmd')

	if (!Array.isArray(msg.entities)) return next()
	const entity = msg.entities.find(e => e.type === 'bot_command')
	if (!entity) return next()
	const cmd = msg.text
	.substr(entity.offset, entity.length)
	.slice(1)
	.toLowerCase()
	.replace(mention, '')
	ctx.command = cmd

	const argsStart = entity.offset + entity.length + 1
	if (msg.text[argsStart - 1] === invisibleSpace) ctx.args = []
	else ctx.args = msg.text.slice(argsStart).split(/\s+/).filter(arg => !!arg)

	if (ctx.prevCommand !== cmd) await ctx.session.put('cmd', cmd)
	next()
}

module.exports = commandMiddleware
