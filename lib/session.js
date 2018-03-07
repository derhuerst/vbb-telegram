'use strict'

const level = require('level')

const last = '\xff'

const createSessionMiddleware = (pathToDb) => {
	const db = level(pathToDb, {valueEncoding: 'json'})

	const _get = (key) => {
		return db.get(key)
		.catch((err) => {
			if (err.notFound) return null
			else throw err
		})
	}

	const createSession = (chat) => {
		const prefix = chat + ':'
		const get = key => _get(prefix + key)
		const put = (key, val) => db.put(prefix + key, val)

		const session = {get, put}
		Object.defineProperty(session, 'prefix', {value: prefix})
		Object.defineProperty(session, 'db', {value: db})
		return session
	}

	const sessionMiddleware = (ctx, next) => {
		Object.defineProperty(ctx, 'session', {
			value: createSession(ctx.chat.id),
			enumerable: true
		})
		next()
	}
	return sessionMiddleware
}

module.exports = createSessionMiddleware
