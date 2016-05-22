'use strict'

const help = (ctx) => ctx.keyboard(`\
*This bot lets you use public transport in Berlin more easily.* You can do this:
- \`/a(bfahrt)\` – Show departures at a station.
- \`/r(oute)\` – Get routes from A to B.
- \`/n(nearby)\` – Show station around.`, [
	  {text: '/a Show departures at a station'}
	, {text: '/r Get routes from A to B.'}
	, {text: '/n Show station around.'}
])

module.exports = help
