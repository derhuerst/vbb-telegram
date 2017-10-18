# vbb-telegram 💬

**A Telegram bot for Berlin & Brandenburg public transport.** [Try it!](https://telegram.me/public_transport_bot)

![the bot in action](screenshot.png)

[![https://telegram.me/public_transport_bot](https://img.shields.io/badge/telegram-%40public__transport__bot-blue.svg)](https://telegram.me/public_transport_bot)
[![dependency status](https://img.shields.io/david/derhuerst/vbb-telegram.svg)](https://david-dm.org/derhuerst/vbb-telegram)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/vbb-telegram.svg)
[![gitter channel](https://badges.gitter.im/derhuerst/vbb-rest.svg)](https://gitter.im/derhuerst/vbb-rest)


## Installing

[Redis](http://redis.io/) needs to be running.

```bash
git clone https://github.com/derhuerst/vbb-telegram.git; cd vbb-telegram
npm install
export NODE_ENV=dev # or `production`
npm start
```

*Note*: [*forever*](https://github.com/foreverjs/forever#readme) actually isn't  required to run `vbb-telegram`, but listed as a [peer dependency](https://docs.npmjs.com/files/package.json#peerdependencies). The `npm start` script calls *forever* for production usage, so to run `npm start`, you need to `npm install [-g] forever` before.


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/vbb-telegram/issues).
