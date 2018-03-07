'use strict'

const level = require('level')
const path = require('path')
const hifo = require('hifo')

const last = '\xff'

const db = level(path.join(__dirname, '..', 'vbb-telegram.ldb'), {
	valueEncoding: 'json'
})

const getCommand = (user) => {
	return db.get(user + ':cmd')
	.catch((err) => {
		if (err.notFound) return null
		else throw err
	})
}

const putCommand = (user, cmd) => {
	return db.put(user + ':cmd', cmd)
}

// todo: sth more efficient
const getTopLocations = (user) => {
	const ns = user + ':locations:'
	const top = hifo(hifo.highest('count'), 3)

	const onItem = ({key, value}) => {
		const id = key.slice(ns.length)
		top.add({id, count: value})
	}

	const items = db.createReadStream({gt: ns, lt: ns + last})
	return new Promise((resolve, reject) => {
		items.once('error', (err) => {
			reject(err)
			items.destroy()
		})
		items.once('end', () => {
			resolve(top.data)
		})
		items.on('data', onItem)
	})
}

const incLocation = async (user, id) => {
	const key = user + ':locations:' + id
	try {
		const count = await db.get(key)
		await db.put(key, count + 1)
	} catch (err) {
		if (err.notFound) await db.put(key, 1)
		else throw err
	}
}

module.exports = {
	getCommand, putCommand,
	getTopLocations, incLocation
}
