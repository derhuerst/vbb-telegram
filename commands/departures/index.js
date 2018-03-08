'use strict'

const searchStations = require('vbb-stations-autocomplete')
const allStations = require('vbb-stations/simple')
const parseTime = require('parse-messy-time')
const linesAt = require('vbb-lines-at')
const hafas = require('vbb-hafas')

const commandKeys = require('../../lib/commands-keyboard')
const whenKeys = require('../../lib/when-keyboard')
const getFrequentStationsKeys = require('../../lib/frequent-stations-keyboard')
const renderDeps = require('./render')

const promptWhen = `\
*When?*
e.g. "now", "in 10 minutes" or "tomorrow 17:20"`
const unknownTime = `\
Hm, don't understand this format.`

const promptWhere = `\
*Which station?*
Enter a station name like "u mehringdamm" or "Kotti".`
const unknownStation = `\
I don't know about this station, please double-check for typos.
If you're sure it's my fault, please let my creator @derhuerst know.`

const findStation = (name) => {
	let [station] = searchStations(name, 1, false, false) // non-fuzzy
	if (!station) [station] = searchStations(name, 1, true, false) // fuzzy
	if (station) station = allStations.find(s => s.id === station.id) // get details
	return station
}

const parseWhere = async (where, ctx) => {
	const station = findStation(where)
	if (station) await ctx.replyWithMarkdown(`I found ${station.name}.`)
	else await ctx.replyWithMarkdown(unknownStation)
	return station
}

const parseWhen = async (when, ctx) => {
	when = +parseTime(when, {now: new Date()})
	if (Number.isNaN(when)) {
		await ctx.replyWithMarkdown(unknownTime)
		return null
	}
	return when
}

const printDeps = async (allDeps, ctx) => {
	for (let i = 0; i < allDeps.length; i += 10) {
		const deps = allDeps.slice(i, i + 10)
		await ctx.replyWithMarkdown(renderDeps(deps), commandKeys)
	}
}

const departures = async (ctx, next) => {
	// `/a spichernstr` shorthand
	if (ctx.args && ctx.args[0]) {
		const station = await parseWhere(ctx.args[0], ctx)
		if (station) await ctx.storage.putData('where', station)
		return next()
	}
	if (ctx.command) {
		const ids = await ctx.storage.getTopLocations()
		await ctx.replyWithMarkdown(promptWhere, getFrequentStationsKeys(ids))
		return next() // await next message
	}

	let where = await ctx.storage.getData('where')
	if (!where) {
		where = await parseWhere(ctx.message.text, ctx)
		if (!where) return next() // await next message
		await ctx.storage.putData('where', where)
		await ctx.storage.incLocation(where.id)

		await ctx.replyWithMarkdown(promptWhen, whenKeys)
		return next() // await next message
	}

	let when = await ctx.storage.getData('when')
	if (!when) {
		when = await parseWhen(ctx.message.text, ctx)
		if (!when) return next() // await next message
		await ctx.storage.putData('when', when)
	}

	// clear session data
	await Promise.all([
		ctx.storage.putData('when', null),
		ctx.storage.putData('where', null)
	])

	let lines = linesAt[where.id] || []
	lines = lines.map(l => '`' + l.name + '`').join(', ')
	await ctx.replyWithMarkdown('*' + where.name + '*\n' + lines)

	// fetch & render deps
	await ctx.replyWithChatAction('typing')
	const deps = await hafas.departures(where.id, when)
	await printDeps(deps, ctx)
	next()
}

module.exports = departures
