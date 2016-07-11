'use strict'

const so = require('so')



const err = (e) => {throw e}

const namespace = (base, ns) => {

	const keys = (p) => {
		const r = new RegExp('^' + ns + ':')
		return base.keys(ns + ':' + p)
		.then((ks) => ks.map((k) => k.replace(r, '')), err)
	}
	const del = (ks) => {
		if (Array.isArray(ks)) ks = ks.map((k) => ns + ':' + k)
		else ks = [ns + ':' + ks]
		return base.del(ks)
	}

	const get = (k) => base.get(ns + ':' + k)
	const mget = (ks) => base.mget(ks.map((k) => ns + ':' + k))

	const set = (k, v) => base.set(ns + ':' + k, v)
	const setnx = (k) => base.setnx(ns + ':' + k)

	const highest = (s, n) => base.highest(ns + ':' + s, n)
	const inc = (s, k) => base.inc(ns + ':' + s, k)

	const clear = so(function* () {
		let ks = yield base.keys(ns + ':*')
		if (ks.length === 0) return []
		yield base.del(ks)
	})

	return {keys, del, get, mget, set, setnx, highest, inc, clear}
}

module.exports = namespace
