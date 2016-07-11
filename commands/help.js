'use strict'

const help = (ctx) => ctx.keyboard(`\
*This bot lets you use public transport in Berlin more easily.* You can do this:
\`/a(bfahrt)\` – Show departures at a station.
\`/r(oute)\` – Get routes from A to B.
\`/n(earby)\` – Show stations around.

When specifying time, you can use the following formats:
- \`now\`
- \`in 10min\`
- \`tomorrow 17:20\`
- \`8 pm\`
- \`tuesday at 6\``, ctx.commands)

module.exports = help
