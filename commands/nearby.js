'use strict'

const Markup = require('telegraf/markup')

const hafas = require('../lib/hafas')
const getCommandKeys = require('../lib/commands-keyboard')

const promptWhere = `Please share your location with me.`
const locationOnly = `Please send a location, other stuff is not supported yet.`

const keyboard = Markup.keyboard([
	Markup.locationRequestButton('send current location')
]).extra()
const noKeyboard = Markup.keyboard([]).extra()

const nearby = async (ctx, next) => {
	const group = ctx.chat.type === 'group'

	if (ctx.command) {
		await ctx.replyWithMarkdown(promptWhere, group ? noKeyboard : keyboard)
		return next()
	}
	if (!ctx.message.location) {
		await ctx.replyWithMarkdown(locationOnly, group ? noKeyboard : keyboard)
		return next()
	}

	// fetch nearby stations
	await ctx.replyWithChatAction('typing')
	const nearby = await hafas.nearby({
		type: 'location',
		address: 'current location',
		latitude: ctx.message.location.latitude,
		longitude: ctx.message.location.longitude
	})

	const l = nearby.length
	for (let i = 0; i < l || i < 10; i++) {
		const s = nearby[i]

		await ctx.replyWithLocation(s.location.latitude, s.location.longitude)
		// todo: link to departures, link to routes
		const text = `${s.distance}m *${s.name}*`
		const group = ctx.chat.type === 'group'
		if (i === (l - 1)) await ctx.replyWithMarkdown(text, getCommandKeys(group))
		else await ctx.replyWithMarkdown(text)
	}
	next()
}

module.exports = nearby
