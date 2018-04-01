'use strict'

const HANDLE = process.env.HANDLE
if (!HANDLE) {
	console.error('Missing HANDLE env var.')
	process.exit(1)
}

const mention = ('@' + HANDLE).toLowerCase()

const inGroupsOnlyMentions = (ctx, next) => {
	if (!ctx.chat || !ctx.chat.type || !ctx.message) return null
	if (ctx.chat.type === 'group') {
		const text = ctx.message.text
		if (text) {
			const i = text.toLowerCase().indexOf(mention)
			if (i < 0) return null // no mention
		}
	}
	next()
}

module.exports = inGroupsOnlyMentions
