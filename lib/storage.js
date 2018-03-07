'use strict'

const hifo = require('hifo')

const last = '\xff'
const range = (db, prefix, onItem) => {
	const items = db.createReadStream({gt: prefix, lt: prefix + last})
	return new Promise((resolve, reject) => {
		items.once('error', (err) => {
			reject(err)
			items.destroy()
		})
		items.once('end', () => resolve())
		items.on('data', onItem)
	})
}

const storageMiddleware = (ctx, next) => {
	if (!ctx.session) return Promise.reject('ctx.session is missing')

	const createGetData = (cmd) => {
		const getData = key => ctx.session.get('data:' + cmd + ':' + key)
		return getData
	}
	const createPutData = (cmd) => {
		const putData = (key, val) => ctx.session.put('data:' + cmd + ':' + key, val)
		return putData
	}

	// todo: use sth more efficient
	const getTopLocations = async () => {
		const prefix = ctx.session.prefix + 'locs:'
		const top = hifo(hifo.highest('count'), 3)

		const onItem = ({key, value}) => {
			const id = key.slice(prefix.length)
			top.add({id, count: value})
		}
		await range(ctx.session.db, prefix, onItem)
		return top.data.map(res => res.id)
	}
	const incLocation = async (id) => {
		const key = 'locs:' + id
		const count = await ctx.session.get(key)
		if (!count) await ctx.session.put(key, 1)
		else await ctx.session.put(key, count + 1)
	}

	const storage = {
		createGetData, createPutData,
		getTopLocations, incLocation
	}
	Object.defineProperty(ctx, 'storage', {
		value: storage,
		enumerable: true
	})
	next()
}

module.exports = storageMiddleware
