'use strict'

const escape = require('js-string-escape')

const logging = async (ctx, next) => {
	const t0 = Date.now()
	await next(ctx)
	const d = Date.now() - t0

	const msg = ctx.message
	console.info([
		d + 'ms',
		msg && msg.date || '[unknown date]',
		msg && msg.chat && msg.chat.id || '[unknown chat]',
		msg && msg.text && escape(msg.text.slice(0, 30)) || '[no message]',
	].join(' '))
}

module.exports = logging
