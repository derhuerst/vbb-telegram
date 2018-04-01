'use strict'

const getCommandKeys = require('../lib/commands-keyboard')

const HANDLE = process.env.HANDLE
if (!HANDLE) {
	console.error('Missing HANDLE env var.')
	process.exit(1)
}

const text = `\
*This bot lets you use public transport in Berlin more easily.* You can do this:
\`/a(bfahrt)\` – Show departures at a station.
\`/r(oute)\` – Get routes from A to B.
\`/n(earby)\` – Show stations around.
When specifying time, you can use the following formats:
- \`now\`
- \`in 10min\`
- \`tomorrow 17:20\`
- \`8 pm\`
- \`tuesday at 6\`
The data behind this bot is from VBB, so departures & routing will be just as (in)accurate as in the BVG & VBB apps.

**When using this bot in a group**, telegram prevents it from listening to normal messages. In this case you need to have two choices:

- Mention the bot in every message. For example: \`/a@${HANDLE} U Friedrichstr.\` and later \`@${HANDLE} in 10 min\`.
- Always reply to the bot with the reply feature.`

const help = async (ctx, next) => {
	const group = ctx.chat.type === 'group'
	await ctx.replyWithMarkdown(text, getCommandKeys(group))
	next()
}

module.exports = help
