'use strict'

const so = require('so')



const frequent = (base, set) => {

	const inc = so(function* (k, v) {
		yield base.setnx(set + ':' + k, v)
		yield base.inc(set, k)
	})

	const get = so(function* (n) {
		let ks = yield base.highest(set, n)
		if (ks.length === 0) return []
		ks = ks.map((k) => set + ':' + k)
		return base.mget(ks)
	})

	get.inc = inc
	return get
}

module.exports = frequent
