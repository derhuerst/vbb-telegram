'use strict'

const searchStations = require('vbb-stations-autocomplete')
const getStations = require('vbb-stations')
const parseTime = require('parse-messy-time')
const hafas = require('vbb-hafas')

const commandKeys = require('../lib/commands-keyboard')
const whenKeys = require('../lib/when-keyboard')

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

const parseWhere = async (where, ctx) => {
	await ctx.replyWithChatAction('typing')
	let [station] = searchStations(where, 1, false, false) // non-fuzzy
	if (!station) [station] = searchStations(where, 1, true, false) // fuzzy
	if (station) [station] = getStations(station.id) // get details

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

const renderDeps = (deps, header) => {
	// todo
}

const printDeps = async (allDeps, ctx) => {
	await ctx.replyWithMarkdown(`todo`, commandKeys) // todo
	for (let i = 0; i < allDeps.length; i += 10) {
		const deps = allDeps.slice(i, i + 10)
		await ctx.replyWithMarkdown(renderDeps(deps), commandKeys)
	}
}

const departures = async (ctx, next) => {
	// `/a spichernstr` shorthand
	if (ctx.state.args && ctx.state.args[0]) {
		const station = await parseWhere(ctx.state.args[0], ctx)
		if (station) await ctx.putData('where', station)
		return next()
	}
	if (ctx.state.cmd) {
		await ctx.replyWithMarkdown(promptWhere) // todo: frequent keyboard
		return next() // await next message
	}

	let where = await ctx.getData('where')
	if (!where) {
		where = await parseWhere(ctx.message.text, ctx)
		if (!where) return next() // await next message
		await ctx.putData('where', where)

		await ctx.replyWithMarkdown(promptWhen, whenKeys)
		return next() // await next message
	}

	let when = await ctx.getData('when')
	if (!when) {
		when = await parseWhen(ctx.message.text, ctx)
		if (!when) return next() // await next message
		await ctx.putData('when', when)
	}

	// clear session data
	await Promise.all([
		ctx.putData('when', null),
		ctx.putData('where', null)
	])

	// fetch & render
	await ctx.replyWithChatAction('typing')
	const deps = await hafas.departures(where.id, when)
	await printDeps(deps, ctx)
	next()
}

module.exports = departures
