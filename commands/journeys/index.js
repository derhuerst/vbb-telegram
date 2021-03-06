'use strict'

const searchStations = require('vbb-stations-autocomplete')
const allStations = require('vbb-stations/simple')
const parseTime = require('parse-messy-time')
const Markup = require('telegraf/markup')

const hafas = require('../../lib/hafas')
const getCommandKeys = require('../../lib/commands-keyboard')
const getWhenKeys = require('../../lib/when-keyboard')
const getFrequentStationsKeys = require('../../lib/frequent-stations-keyboard')
const renderJourney = require('./render')

const promptWhen = `\
*When?*
e.g. "now", "in 10 minutes" or "tomorrow 17:20"`
const unknownTime = `\
Hm, don't understand this format.`

const promptOrigin = `\
*Where do you start?*
Enter a location like "U mehringdamm", "Kaiserdamm 26" or send your location.`
const promptDest = `\
*Where do you want to go?*`
const unknownStation = `\
I don't know about this station, please double-check for typos.
If you're sure it's my fault, please let my creator @derhuerst know.`
const textOrLocation = `\
Only location names like "U mehringdamm", "Kaiserdamm 26" and locations are supported.`

const parseWhere = async (msg, ctx) => {
	if (msg.textWithoutMention) {
		let [loc] = searchStations(msg.textWithoutMention, 1, false, false) // non-fuzzy
		if (loc) {
			loc = allStations.find(s => s.id === loc.id) // get details
		} else {
			[loc] = await hafas.locations(msg.textWithoutMention, {results: 1})
		}
		const text = loc ? `I found ${loc.name || loc.address}.` : unknownStation
		await ctx.replyWithMarkdown(text)
		return loc
	} else if (msg.location) {
		return {
			type: 'location',
			address: 'current location',
			latitude: msg.location.latitude,
			longitude: msg.location.longitude
		}
	} else ctx.replyWithMarkdown(textOrLocation)
}

const parseWhen = async (when, ctx) => {
	when = +parseTime(when, {now: new Date()})
	if (Number.isNaN(when)) {
		await ctx.replyWithMarkdown(unknownTime)
		return null
	}
	return when
}

const getFrequentStationKeys = async (ctx) => {
	const ids = await ctx.storage.getTopLocations()
	const group = ctx.chat.type === 'group'
	return getFrequentStationsKeys(ids, group, true)
}

const journeys = async (ctx, next) => {
	ctx.freqStationKeys = await getFrequentStationKeys(ctx)

	// `/j u spichernstr` shorthand
	if (ctx.args && ctx.args.length > 0) {
		const origin = await parseWhere(ctx.args.join(' '), ctx)
		if (origin) await ctx.storage.putData('origin', origin)
		return next()
	}
	if (ctx.command) {
		await ctx.replyWithMarkdown(promptOrigin, ctx.freqStationKeys)
		return next() // await next message
	}

	let origin = await ctx.storage.getData('origin')
	if (!origin) {
		origin = await parseWhere(ctx.message, ctx)
		if (!origin) return next() // await next message
		await ctx.storage.putData('origin', origin)
		await ctx.storage.incLocation(origin.id)

		await ctx.replyWithMarkdown(promptDest, ctx.freqStationKeys)
		return next() // await next message
	}

	let destination = await ctx.storage.getData('destination')
	if (!destination) {
		destination = await parseWhere(ctx.message, ctx)
		if (!destination) return next() // await next message
		await ctx.storage.putData('destination', destination)
		await ctx.storage.incLocation(destination.id)

		const group = ctx.chat.type === 'group'
		await ctx.replyWithMarkdown(promptWhen, getWhenKeys(group))
		return next() // await next message
	}

	let when = await ctx.storage.getData('when')
	if (!when) {
		when = await parseWhen(ctx.message.textWithoutMention, ctx)
		if (!when) return next() // await next message
		await ctx.storage.putData('when', when)
	}

	// clear session data
	await Promise.all([
		ctx.storage.putData('origin', null),
		ctx.storage.putData('destination', null),
		ctx.storage.putData('when', null)
	])

	// fetch & render journeys
	await ctx.replyWithChatAction('typing')
	const journeys = await hafas.journeys(origin, destination, {departure: when})
	const group = ctx.chat.type === 'group'
	for (let j of journeys) {
		await ctx.replyWithMarkdown(renderJourney(j), getCommandKeys(group))
	}

	next()
}

module.exports = journeys
