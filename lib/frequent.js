'use strict'

const so = require('so')



const frequent = (base, set) => {

	const inc = so(function* (k, v) {
		yield base.setnx(ns + ':' + set + ':' + k, v)
		yield base.inc(ns + ':' + set, 1, k)
	})

	const get = so(function* (n) {
		let keys = yield base.highest(ns + ':' + set, n)
		if (keys.length === 0) return null
		keys = keys.map((k) => ns + ':' + set + ':' + k)
		return base.mget(keys)
	})

	get.inc = inc
	return get
}

module.exports = frequent
