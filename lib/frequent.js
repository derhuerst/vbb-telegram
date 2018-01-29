'use strict'

const frequent = (base, set) => {

	const inc = async (k, v) => {
		await base.setnx(set + ':' + k, v)
		await base.inc(set, k)
	}

	const get = async (n) => {
		let ks = await base.highest(set, n)
		if (ks.length === 0) return []
		ks = ks.map((k) => set + ':' + k)
		return base.mget(ks)
	}

	get.inc = inc
	return get
}

module.exports = frequent
