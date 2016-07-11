'use strict'

const state = (base, key) => {

	const get = () => base.get(key)
	const set = (v) => base.set(key, v)

	get.set = set
	return get
}

module.exports = state
