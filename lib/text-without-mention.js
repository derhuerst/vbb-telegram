'use strict'

const HANDLE = process.env.HANDLE
if (!HANDLE) {
	console.error('Missing HANDLE env var.')
	process.exit(1)
}

const mention = ('@' + HANDLE).toLowerCase()

// '/foo@bot bar' -> '/foo bar'
// '/foo@bot' -> '/foo'
// '/foo @bot bar' -> '/foo bar'
// '/foo @bot' -> '/foo'
// '@bot foo' -> 'foo'
// '@bot' -> ''
// '@bot /foo bar' -> '/foo bar'
// ' @bot /foo bar' -> ' /foo bar'
const textWithoutMention = (ctx, next) => {
	if (!ctx.message || !ctx.message.text) { // ignore
		next()
		return
	}
	const text = ctx.message.text

	const i = text.indexOf(mention)
	if (i < 0) return null

	const afterSpace = text[i - 1] === ' '
	const atTheStart = i === 0
	const beforeSpace = text[i + mention.length] === ' '
	const atTheEnd = text.length === (i + mention.length)

	let start = i, end = i + mention.length
	if (afterSpace && atTheEnd) start--
	else if (beforeSpace && atTheStart) end++
	else if (beforeSpace && afterSpace) end++

	ctx.message.textWithoutMention = text.slice(0, start) + text.slice(end)
	next()
}

module.exports = textWithoutMention
